const express = require('express');
const externalLinks = require('./utils/externalLinks');

module.exports = ({ db, configuration, communes }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/', async (req, res) => {

        let [avisCount, organismesCount, stagiairesCount] = await Promise.all([
            db.collection('comment').count(),
            db.collection('accounts').count({ 'profile': 'organisme', 'score.nb_avis': { $gte: 1 } }),
            db.collection('trainee').count({ mailSentDate: { $ne: null } })
        ]);

        res.render('front/homepage', {
            avisCount: new Intl.NumberFormat('fr').format(avisCount),
            organismesCount: new Intl.NumberFormat('fr').format(organismesCount),
            stagiairesCount: new Intl.NumberFormat('fr').format(stagiairesCount),
            data: configuration.front,
            failed: req.query.failed
        });
    });

    router.get('/cgu', (req, res) => {
        res.render('front/cgu');
    });

    router.get('/politique-confidentialite', (req, res) => {
        res.render('front/politique-confidentialite');
    });

    router.get('/services/organismes', (req, res) => {
        res.render('front/faq_organismes');

    });

    router.get('/services/stagiaires', (req, res) => {
        res.render('front/faq_stagiaires');
    });

    router.get('/services/financeurs', (req, res) => {
        res.render('front/faq_financeurs');
    });

    router.get('/doc/:name', (req, res) => {
        let template = req.params.name;

        if (!['widget'].includes(template)) {
            res.status(404).render('errors/404');
            return;
        }

        if (template === 'widget' && configuration.env === 'dev' && !req.query['load_anotea_widget_iframe_from_localhost']) {
            return res.redirect('/doc/widget?load_anotea_widget_iframe_from_localhost=true');
        }

        return res.render(`front/doc/${template}`);
    });

    router.get('/link/:token', async (req, res) => {

        let trainee = await db.collection('trainee').findOne({ token: req.params.token });
        if (!trainee) {
            res.status(404).send({ error: 'not found' });
            return;
        }

        const goto = req.query.goto;

        const links = ['lbb', 'pe', 'clara'];

        if (!links.includes(goto)) {
            res.status(404).render('errors/404');
            return;
        }

        if (!(trainee.tracking &&
            trainee.tracking.clickLinks &&
            trainee.tracking.clickLinks.filter(item => item.goto === goto).length > 0)) {
            db.collection('trainee').updateOne({ token: req.params.token }, {
                $push: {
                    'tracking.clickLinks': {
                        date: new Date(),
                        goto: goto
                    }
                }
            });
        }

        res.redirect(await externalLinks(db, communes).getLink(trainee, goto));
    });

    return router;
};
