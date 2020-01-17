const express = require('express');
const moment = require('moment');
const _ = require('lodash');
const { getDeviceType } = require('./utils/analytics');
const Boom = require('boom');
const Joi = require('joi');
const externalLinks = require('../../utils/externalLinks');
const { sanitize } = require('./utils/userInput');
const { tryAndCatch } = require('../../utils/routes-utils');
const { AlreadySentError, BadDataError } = require('../../../core/errors');

module.exports = ({ db, logger, configuration, regions, communes }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let badwords = require('./utils/badwords')(logger, configuration);

    const getStagiaireFromToken = (req, res, next) => {
        db.collection('stagiaires').findOne({ token: req.params.token })
        .then(stagiaire => {
            if (!stagiaire) {
                res.status(404).send({ error: 'not found' });
                return;
            }

            req.stagiaire = stagiaire;
            next();
        });
    };

    const saveDeviceData = async (req, res, next) => {
        let stagiaire = req.stagiaire;
        let now = new Date();
        let lastSeenDate = stagiaire.lastSeenDate;
        let isNewSession = !lastSeenDate || Math.ceil(moment.duration(moment(now).diff(moment(lastSeenDate))).asMinutes()) > 30;
        let devices = getDeviceType(req.headers['user-agent']);

        db.collection('stagiaires').updateOne({ _id: stagiaire._id }, {
            ...(isNewSession && devices.phone ? { $inc: { 'deviceTypes.phone': 1 } } : {}),
            ...(isNewSession && devices.tablet ? { $inc: { 'deviceTypes.tablet': 1 } } : {}),
            ...(isNewSession && devices.desktop ? { $inc: { 'deviceTypes.desktop': 1 } } : {}),
            $set: { lastSeenDate: now }
        }).catch(e => logger.error(e));

        next();
    };

    const validateNotes = body => {
        const rateRule = Joi.number().integer().min(1).max(5).required();

        const schema = Joi.object().keys({
            accueil: rateRule,
            contenu_formation: rateRule,
            equipe_formateurs: rateRule,
            moyen_materiel: rateRule,
            accompagnement: rateRule
        });
        let rates = {
            accueil: body.avis_accueil,
            contenu_formation: body.avis_contenu_formation,
            equipe_formateurs: body.avis_equipe_formateurs,
            moyen_materiel: body.avis_moyen_materiel,
            accompagnement: body.avis_accompagnement
        };

        return Joi.validate(rates, schema);
    };

    const calculateAverageRate = avis => {
        let sum = avis.rates.accueil +
            avis.rates.contenu_formation +
            avis.rates.equipe_formateurs +
            avis.rates.moyen_materiel +
            avis.rates.accompagnement;

        return Number(Math.round((sum / 5) + 'e1') + 'e-1');
    };


    const buildAvis = (notes, token, body, stagiaire) => {

        let text = _.get(body, 'commentaire.texte', null);
        let title = _.get(body, 'commentaire.titre', null);
        let hasCommentaires = title || text;

        let avis = {
            date: new Date(),
            token: token,
            campaign: stagiaire.campaign,
            training: stagiaire.training,
            codeRegion: stagiaire.codeRegion,
            rates: notes,
            pseudo: sanitize(body.pseudo.replace(/ /g, '').replace(/\./g, '')),
            read: false,
            status: hasCommentaires ? 'none' : 'validated',
            lastStatusUpdate: new Date(),
        };

        if (hasCommentaires) {
            avis.commentaire = {
                title: sanitize(title),
                text: sanitize(text),
                titleMasked: false,
            };
        }

        return avis;
    };

    const validateAvis = async avis => {

        if (avis.pseudo.length > 50 ||
            (avis.commentaire !== undefined && (avis.commentaire.title.length > 50 || avis.commentaire.text.length > 200))) {
            return { error: 'too long' };
        }

        let pseudoOK = avis.pseudo ? await badwords.isGood(avis.pseudo) : true;
        let textOK = avis.commentaire ? await badwords.isGood(avis.commentaire.text) : true;
        let titleOK = avis.commentaire ? await badwords.isGood(avis.commentaire.title) : true;

        if (pseudoOK && textOK && titleOK) {
            return { error: null, avis };
        } else {
            let badwords = {
                pseudo: !pseudoOK,
                textOK: !textOK,
                titleOK: !titleOK
            };
            return { error: 'badwords', badwords };
        }

    };

    const getInfosRegion = async stagiaire => {

        let trainingTooOld = stagiaire.training.scheduledEndDate < moment().subtract(90, 'days');
        let region = regions.findRegionByCodeRegion(stagiaire.codeRegion);

        return {
            stagiaire,
            region,
            showLinks: await externalLinks(db, communes).getLink(stagiaire, 'pe') !== null && !trainingTooOld
        };
    };

    router.get('/api/questionnaire/checkBadwords', tryAndCatch(async (req, res) => {
        if (await badwords.isGood(req.query.sentence)) {
            return res.json({ isGood: true });
        }
        throw Boom.badRequest('Mot invalide');

    }));

    router.get('/api/questionnaire/:token', getStagiaireFromToken, saveDeviceData, tryAndCatch(async (req, res) => {

        let stagiaire = req.stagiaire;

        if (!stagiaire.avisCreated) {
            db.collection('stagiaires').updateOne({ token: req.params.token }, { $set: { 'tracking.click': new Date() } });
        }

        let infosRegion = await getInfosRegion(stagiaire);
        return res.send({ stagiaire, infosRegion, submitted: stagiaire.avisCreated });
    }));

    router.post('/api/questionnaire/:token', getStagiaireFromToken, tryAndCatch(async (req, res) => {

        let stagiaire = req.stagiaire;

        if (stagiaire.avisCreated) {
            throw new AlreadySentError();
        }

        let resultNotes = validateNotes(req.body);
        if (resultNotes.error === null) {

            const avis = buildAvis(resultNotes.value, req.params.token, req.body, req.stagiaire);

            let validation = await validateAvis(avis);
            if (validation.error === null) {
                avis.rates.global = calculateAverageRate(avis);
                await Promise.all([
                    db.collection('avis').insertOne(avis),
                    db.collection('stagiaires').updateOne({ _id: stagiaire._id }, { $set: { avisCreated: true } }),
                ]);
            } else {
                throw new BadDataError();
            }
        } else {
            throw new BadDataError();
        }

        return res.send({ stagiaire, infosRegion: await getInfosRegion(stagiaire) });
    }));

    return router;
};
