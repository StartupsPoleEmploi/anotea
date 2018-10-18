module.exports = (db, logger, configuration, badwords) => {

    const express = require('express');
    const s = require('string');
    const router = express.Router(); // eslint-disable-line new-cap
    const moment = require('moment');
    const Joi = require('joi');

    const analytics = require('../../components/analytics')(db, logger, configuration);

    router.get('/', function(req, res) {
        res.render('front/homepage', { data: configuration.front });
    });

    router.get('/cgu', function(req, res) {
        res.render('front/cgu');
    });

    router.get('/faq', function(req, res) {
        res.render('front/faq');
    });

    router.get('/questionnaire/:token', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });
        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        analytics.buildDeviceTypesHistory(trainee, req);

        // We check if advice not already sent
        let comment = await db.collection('comment').findOne({
            token: req.params.token,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession
        });
        if (comment === null) {
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
            db.collection('comment').save(comment);
        }
        // we let user change it's advice if last step not validated
        if (comment !== null && comment.step === 3) {
            res.render('front/refus', { reason: 'already sent', trainee: trainee });
        } else {
            res.render('front/questionnaire-step1', { trainee: trainee, moment: moment });
        }
    });

    router.post('/questionnaire/:token/step1', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });

        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        const comment = await db.collection('comment').findOne({
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
                db.collection('comment').save(comment);
                res.render('front/questionnaire-step2', { trainee: trainee });
            } else {
                res.render('front/refus', { reason: 'bad data', trainee: trainee });
            }
        } else {
            res.render('front/refus', { reason: 'bad data', trainee: trainee });
        }
    });

    router.post('/questionnaire/:token/step2', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });

        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        const comment = await db.collection('comment').findOne({
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
            let pseudo = req.body.pseudo;
            let commentTxt = s(req.body.commentaire).escapeHTML().s;
            let commentTitle = s(req.body.titreCommentaire).escapeHTML().s;

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
                    db.collection('comment').save(comment);
                    const carif = await db.collection('carif').findOne({ codeRegion: trainee.codeRegion });

                    res.render('front/questionnaire-step3', {
                        trainee: trainee,
                        carifURL: carif.url,
                        carifLinkEnabled: carif.formLinkEnabled
                    });
                    return;
                } else {
                    comment.badwords = {
                        pseudo: !pseudoOK,
                        comment: !commentOK,
                        commentTitle: !commentTitleOK
                    };
                    db.collection('comment').save(comment);

                }
            } else {
                res.render('front/refus', { reason: 'alphanum', trainee: trainee });
                return;
            }
            res.render('front/refus', { reason: 'badwords', trainee: trainee });
        }
    });

    return router;
};
