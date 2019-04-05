const express = require('express');
const externalLinks = require('./utils/externalLinks');

module.exports = ({ db, configuration }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    const getTraineeFromToken = (req, res, next) => {
        db.collection('trainee').findOne({ token: req.params.token })
        .then(trainee => {
            if (!trainee) {
                res.status(404).send({ error: 'not found' });
                return;
            }

            req.trainee = trainee;
            next();
        });
    };

    router.get('/', (req, res) => {
        res.render('front/homepage', { data: configuration.front });
    });

    router.get('/cgu', (req, res) => {
        res.render('front/cgu');
    });

    router.get('/faq', (req, res) => {
        res.render('front/faq');
    });

    router.get('/stats', async (req, res) => {

        let computeOrganismesStats = async (query = {}) => {
            let [nbOrganismes, actifs, hasAtLeastOneAvis] = await Promise.all([
                db.collection('accounts').count({ 'profile': 'organisme', ...query }),
                db.collection('accounts').count({
                    'profile': 'organisme',
                    'passwordHash': { $exists: true }, ...query
                }),
                db.collection('accounts').count({ 'profile': 'organisme', 'score.nb_avis': { $gt: 0 }, ...query }),
            ]);

            return { nbOrganismes, actifs, hasAtLeastOneAvis };
        };

        let [organismes, kairos] = await Promise.all([
            computeOrganismesStats(),
            computeOrganismesStats({ 'sources': { $in: ['kairos'] } }),
        ]);

        res.render('front/stats', {
            organismes,
            kairos: {
                ...kairos,
                kibanaDashboardUrl: 'https://anotea.kibana.pole-emploi.fr/app/kibana#/dashboard/d545e8a0-4738-11e9-a788-0de26b41fc5f?embed=true&_g=(refreshInterval%3A(display%3A\'30%20seconds\'%2Cpause%3A!f%2Csection%3A1%2Cvalue%3A30000)%2Ctime%3A(from%3Anow%2FM%2Cinterval%3Aauto%2Cmode%3Aquick%2Ctimezone%3AEurope%2FBerlin%2Cto%3Anow%2FM))',
            }
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
