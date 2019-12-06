const express = require('express');
const externalLinks = require('./utils/externalLinks');

module.exports = ({ db, configuration, communes }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/', (req, res) => {
        res.render('front/homepage', { data: configuration.front });
    });

    router.get('/cgu', (req, res) => {
        res.render('front/cgu');
    });

    router.get('/faq', (req, res) => {
        res.render('front/faq');
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
