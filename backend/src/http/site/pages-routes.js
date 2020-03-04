const moment = require('moment');
const express = require('express');
const externalLinks = require('../utils/externalLinks');
const { getFullUrl } = require('../utils/routes-utils');

module.exports = ({ db, configuration, communes, peconnect, sentry }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let utils = {
        getBackofficeUrl: () => `${(configuration.app.public_hostname)}/backoffice`,
        analytics: configuration.analytics,

    };

    router.get('/', async (req, res) => {

        let [avisCount, organismesCount, stagiairesCount] = await Promise.all([
            db.collection('avis').count(),
            db.collection('accounts').count({ 'profile': 'organisme', 'score.nb_avis': { $gte: 1 } }),
            db.collection('stagiaires').count({ mailSentDate: { $ne: null } })
        ]);

        res.render('homepage', {
            avisCount: new Intl.NumberFormat('fr').format(avisCount),
            organismesCount: new Intl.NumberFormat('fr').format(organismesCount),
            stagiairesCount: new Intl.NumberFormat('fr').format(stagiairesCount),
            data: configuration.front,
            failed: req.query.failed,
            utils,
        });
    });

    router.get('/cgu', (req, res) => {
        res.render('cgu', { utils });
    });

    router.get('/politique-confidentialite', (req, res) => {
        res.render('politique-confidentialite', { utils });
    });

    router.get('/services/organismes', (req, res) => {
        res.render('faq_organismes', { utils });

    });

    router.get('/services/stagiaires', (req, res) => {
        res.render('faq_stagiaires', { utils });
    });

    router.get('/services/financeurs', (req, res) => {
        res.render('faq_financeurs', { utils });
    });

    router.get('/peconnect', async (req, res) => {
        let authenticationUrl = await peconnect.getAuthenticationUrl();
        return res.redirect(authenticationUrl);
    });

    router.get('/peconnect/callback', async (req, res) => {

        try {
            let userInfo = await peconnect.getUserInfo(getFullUrl(req));

            const results = await db.collection('stagiaires').find({
                'individu.email': userInfo.email.toLowerCase(),
                'avisCreated': false,
                'formation.action.session.periode.fin': { $gte: moment().subtract(1, 'years').toDate() }
            })
            .sort({ 'formation.action.session.periode.fin': -1 })
            .limit(1)
            .toArray();

            if (results.length === 0) {
                return res.render('errors/formationNotFound');
            }

            let stagiaire = results[0];
            db.collection('stagiaires').updateOne({ _id: stagiaire._id }, { $set: { 'tracking.peConnectSucceed': new Date() } });
            return res.redirect(`${configuration.app.public_hostname}/questionnaire/${stagiaire.token}`);
        } catch (e) {
            sentry.sendError(e);
            return res.status(500).render('errors/error');
        }
    });

    router.get('/doc/widget', (req, res) => {

        if (configuration.env === 'dev' && !req.query['load_anotea_widget_iframe_from_localhost']) {
            return res.redirect('/doc/widget?load_anotea_widget_iframe_from_localhost=true');
        }

        return res.render('widget');
    });

    router.get('/link/:token', async (req, res) => {

        let stagiaire = await db.collection('stagiaires').findOne({ token: req.params.token });
        if (!stagiaire) {
            res.status(404).send({ error: 'not found' });
            return;
        }

        const goto = req.query.goto;

        const links = ['lbb', 'pe', 'clara'];

        if (!links.includes(goto)) {
            res.status(404).render('errors/404');
            return;
        }

        if (!(stagiaire.tracking &&
            stagiaire.tracking.clickLinks &&
            stagiaire.tracking.clickLinks.filter(item => item.goto === goto).length > 0)) {
            db.collection('stagiaires').updateOne({ token: req.params.token }, {
                $push: {
                    'tracking.clickLinks': {
                        date: new Date(),
                        goto: goto
                    }
                }
            });
        }

        res.redirect(await externalLinks(db, communes).getLink(stagiaire, goto));
    });

    return router;
};
