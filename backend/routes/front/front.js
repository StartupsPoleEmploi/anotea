const express = require('express');
const moment = require('moment');
const Joi = require('joi');
const s = require('string');
const { getDeviceType } = require('./utils/analytics');
const { sanitize } = require('./utils/userInput');
const externalLinks = require('./utils/externalLinks');

module.exports = ({ db, logger, configuration }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let badwords = require('./utils/badwords')(logger, configuration);

    const getTraineeFromToken = (req, res, next) => {
        db.collection('trainee').findOne({ token: req.params.token })
        .then(trainee => {
            if (!trainee) {
                res.status(404).render('errors/404');
                return;
            }

            req.trainee = trainee;
            next();
        });
    };

    const saveDeviceData = async (req, res, next) => {
        let trainee = req.trainee;
        let now = new Date();
        let lastSeenDate = trainee.lastSeenDate;
        let isNewSession = !lastSeenDate || Math.ceil(moment.duration(moment(now).diff(moment(lastSeenDate))).asMinutes()) > 30;
        let devices = getDeviceType(req.headers['user-agent']);

        db.collection('trainee').updateOne({ _id: trainee._id }, {
            ...(isNewSession && devices.phone ? { $inc: { 'deviceTypes.phone': 1 } } : {}),
            ...(isNewSession && devices.tablet ? { $inc: { 'deviceTypes.tablet': 1 } } : {}),
            ...(isNewSession && devices.desktop ? { $inc: { 'deviceTypes.desktop': 1 } } : {}),
            $set: { lastSeenDate: now }
        }).catch(e => logger.error(e));

        next();
    };

    router.get('/', function(req, res) {
        res.render('front/homepage', { data: configuration.front });
    });

    router.get('/cgu', function(req, res) {
        res.render('front/cgu');
    });

    router.get('/faq', function(req, res) {
        res.render('front/faq');
    });

    router.get('/questionnaire/:token', getTraineeFromToken, saveDeviceData, async (req, res) => {

        let trainee = req.trainee;
        // We check if advice not already sent
        let comment = await db.collection('comment').findOne({
            token: req.params.token,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession
        });

        if (!comment) {
            comment = {
                date: new Date(),
                token: req.params.token,
                campaign: trainee.campaign,
                formacode: trainee.training.formacode,
                idSession: trainee.training.idSession,
                training: trainee.training,
                step: 1,
                codeRegion: trainee.codeRegion
            };

            db.collection('comment').insertOne(comment).catch(e => logger.error(e));
        }

        // we let user change it's advice if last step not validated
        if (comment && comment.step === 3) {
            res.render('front/refus', { reason: 'already sent', trainee: trainee });
        } else {
            res.render('front/questionnaire-step1', { trainee: trainee, moment: moment });
        }
    });

    router.post('/questionnaire/:token/step1', getTraineeFromToken, async (req, res) => {

        let trainee = req.trainee;
        let comment = await db.collection('comment').findOne({
            token: req.params.token,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession
        });

        // we let user change it's advice if last step not validated
        if (comment !== null && comment.step === 3) {
            res.render('front/refus', { reason: 'already sent', trainee: trainee });
        } else if (comment !== null) {

            const rateRule = Joi.number().integer().min(1).max(5).required();

            const schema = Joi.object().keys({
                accueil: rateRule,
                contenu_formation: rateRule,
                equipe_formateurs: rateRule,
                moyen_materiel: rateRule,
                accompagnement: rateRule,
                global: rateRule,
            });
            let rates = {
                accueil: req.body.avis_accueil,
                contenu_formation: req.body.avis_contenu_formation,
                equipe_formateurs: req.body.avis_equipe_formateurs,
                moyen_materiel: req.body.avis_moyen_materiel,
                accompagnement: req.body.avis_accompagnement,
                global: req.body.avis_global
            };

            const result = Joi.validate(rates, schema);
            if (result.error === null) {
                comment.rates = result.value;
                comment.accord = false;
                comment.accordEntreprise = false;
                comment.step = 2;
                await Promise.all([
                    db.collection('comment').save(comment),
                    db.collection('trainee').updateOne({ _id: trainee._id }, { $set: { avisCreated: true } }),
                ]);
                res.render('front/questionnaire-step2', { trainee: trainee });
            } else {
                res.render('front/refus', { reason: 'bad data', trainee: trainee });
            }
        } else {
            res.render('front/refus', { reason: 'bad data', trainee: trainee });
        }
    });

    router.post('/questionnaire/:token/step2', getTraineeFromToken, async (req, res) => {

        let trainee = req.trainee;
        let comment = await db.collection('comment').findOne({
            token: req.params.token,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession
        });
        // we let user change it's advice if last step not validated
        if (comment !== null && comment.step === 3) {
            res.render('front/refus', { reason: 'already sent', trainee: trainee });
        } else if (comment === null) {
            // too soon : redirect to first form step
            res.redirect('/questionnaire/' + req.params.token);
        } else if (comment !== null && comment.step === 2) {
            // update
            let pseudo = sanitize(req.body.pseudo);
            let commentTxt = sanitize(req.body.commentaire);
            let commentTitle = sanitize(req.body.titreCommentaire);

            if (s(pseudo.replace(/ /g, '')).isAlphaNumeric()) {
                comment.pseudo = pseudo;
                if (commentTitle !== '' || commentTxt !== '') {
                    comment.comment = {
                        title: commentTitle,
                        text: commentTxt
                    };
                }
                comment.accord = req.body.accord === 'on';
                comment.accordEntreprise = req.body.accordEntreprise === 'on';

                let pseudoOK = badwords.isGood(pseudo);
                let commentOK = badwords.isGood(commentTxt);
                let commentTitleOK = badwords.isGood(commentTitle);
                if (pseudoOK && commentOK && commentTitleOK) {
                    comment.step = 3;
                    delete comment.badwords;
                    db.collection('comment').updateOne({ _id: comment._id }, { $set: comment });
                    res.redirect(`/questionnaire/${req.params.token}/step3`);
                    return;
                } else {
                    comment.badwords = {
                        pseudo: !pseudoOK,
                        comment: !commentOK,
                        commentTitle: !commentTitleOK
                    };
                    db.collection('comment').updateOne({ _id: comment._id }, { $set: comment });

                }
            } else {
                res.render('front/refus', { reason: 'alphanum', trainee: trainee });
                return;
            }
            res.render('front/refus', { reason: 'badwords', trainee: trainee });
        }
    });

    router.get('/questionnaire/:token/step3', getTraineeFromToken, async (req, res) => {
        let trainee = req.trainee;
        const carif = await db.collection('carif').findOne({ codeRegion: trainee.codeRegion });

        res.render('front/questionnaire-step3', {
            trainee: trainee,
            carifURL: carif.url,
            carifLinkEnabled: carif.formLinkEnabled,
            showLinks: await externalLinks(db).getLink(trainee, 'pe') !== null
        });
    });

    router.get('/link/:token', getTraineeFromToken, async (req, res) => {
        let trainee = req.trainee;
        const goto = req.query.goto;

        const links = ['lbb', 'pe', 'clara'];

        if (!links.includes(goto)) {
            res.status(404).render('errors/404');
            return;
        }

        const advice = await db.collection('comment').findOne({ token: req.params.token });
        if (!(advice.tracking && advice.tracking.clickLink && advice.tracking.clickLink.filter(item => item.goto === goto).length > 0)) {
            db.collection('comment').updateOne({ token: req.params.token }, {
                $push: {
                    'tracking.clickLink': {
                        date: new Date(),
                        goto: goto
                    }
                }
            });
        }

        res.redirect(await externalLinks(db).getLink(trainee, goto));
    });

    return router;
};
