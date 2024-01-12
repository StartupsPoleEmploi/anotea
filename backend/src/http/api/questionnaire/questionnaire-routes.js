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

    const getStagiaireFromToken = async (req, res, next) => {
        try {
            let { token } = await Joi.validate(req.params, {
                token: Joi.string().required()
            }, { abortEarly: false });
            db.collection('stagiaires').findOne({ token: token })
            .then(stagiaire => {
                if (!stagiaire) {
                    res.status(404).send({ error: 'not found' });
                    return;
                }

                req.stagiaire = stagiaire;
                next();
            });
        } catch (e) {
            res.status(404).send({ error: 'not found' });
            return;
        }
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
        let notes = {
            accueil: body.avis_accueil,
            contenu_formation: body.avis_contenu_formation,
            equipe_formateurs: body.avis_equipe_formateurs,
            moyen_materiel: body.avis_moyen_materiel,
            accompagnement: body.avis_accompagnement
        };

        return Joi.validate(notes, schema);
    };

    const calculateAverageRate = avis => {
        let sum = avis.notes.accueil +
            avis.notes.contenu_formation +
            avis.notes.equipe_formateurs +
            avis.notes.moyen_materiel +
            avis.notes.accompagnement;

        return Number(Math.round((sum / 5) + 'e1') + 'e-1');
    };

    const buildAvis = (notes, token, body, stagiaire) => {
        
        Joi.assert(body.commentaire, {
            texte: Joi.string().allow(null, ''),
            titre: Joi.string().allow(null, ''),
        }, { abortEarly: false });
        
        let text = sanitize(_.get(body, 'commentaire.texte', null));
        let title = sanitize(_.get(body, 'commentaire.titre', null));
        let hasCommentaire = !!(title || text);

        let avis = {
            date: new Date(),
            token: token,
            campaign: stagiaire.campaign,
            formation: stagiaire.formation,
            codeRegion: stagiaire.codeRegion,
            refreshKey: stagiaire.refreshKey,
            notes: notes,
            read: false,
            status: hasCommentaire ? 'none' : 'validated',
            lastStatusUpdate: new Date(),
            dispositifFinancement: stagiaire.dispositifFinancement,
        };

        if (hasCommentaire) {
            avis.commentaire = {
                title,
                text,
                titleMasked: false,
            };
        }

        return avis;
    };

    const validateAvis = async avis => {

        if (avis.commentaire !== undefined && (avis.commentaire.title.length > 50 || avis.commentaire.text.length > 200)) {
            return { error: 'too long' };
        }

        let textOK = avis.commentaire ? await badwords.isGood(avis.commentaire.text) : true;
        let titleOK = avis.commentaire ? await badwords.isGood(avis.commentaire.title) : true;

        if (textOK && titleOK) {
            return { error: null, avis };
        } else {
            let badwords = {
                textOK: !textOK,
                titleOK: !titleOK
            };
            return { error: 'badwords', badwords };
        }

    };

    const getInfosRegion = async stagiaire => {

        let formationTooOld = stagiaire.formation.action.session.periode.fin < moment().subtract(90, 'days');
        let region = regions.findRegionByCodeRegion(stagiaire.codeRegion);

        return {
            region,
            showLinks: await externalLinks(db, communes).getLink(stagiaire, 'pe') !== null && !formationTooOld
        };
    };

    router.get('/api/questionnaire/checkBadwords', tryAndCatch(async (req, res) => {
        try {
            let { sentence } = await Joi.validate(req.query, {
                sentence: Joi.string().required(),
            }, { abortEarly: false });

            if (await badwords.isGood(sentence)) {
                return res.json({ isGood: true });
            }
            throw Boom.badRequest('Mot invalide');
        } catch (err) {
            throw Boom.badRequest('Mot invalide');
        }

    }));

    router.get('/api/questionnaire/:token', getStagiaireFromToken, saveDeviceData, tryAndCatch(async (req, res) => {

        let stagiaire = req.stagiaire;

        if (!stagiaire.avisCreated) {
            db.collection('stagiaires').updateOne({ token: req.params.token }, { $set: { 'tracking.click': new Date() } });
        }

        let infosRegion = await getInfosRegion(stagiaire);
        return res.send({
            stagiaire: { formation: stagiaire.formation, token: stagiaire.token },
            infosRegion,
            submitted: stagiaire.avisCreated
        });
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
                avis.notes.global = calculateAverageRate(avis);
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
