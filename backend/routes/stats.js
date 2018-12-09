const express = require('express');
const moment = require('moment');
const regions = require('../components/regions');
const tryAndCatch = require('./tryAndCatch');

module.exports = (db, configuration) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const dataExposer = require('../components/dataExposer')();

    const computeCommentStats = async codeRegion => {
        let match = { $match: {} };
        let matchUnwind = { $match: {} };

        if (codeRegion !== undefined) {
            match = {
                '$match': {
                    'codeRegion': codeRegion
                }
            };

            matchUnwind = {
                '$match': {
                    'comments.codeRegion': codeRegion
                }
            };
        }

        const docs = await db.collection('trainee').aggregate([
            match,
            {
                $group: {
                    _id: '$campaign',
                    date: { $first: '$mailSentDate' },
                    mailSent: { $sum: { $cond: ['$mailSent', 1, 0] } },
                    mailOpen: { $sum: { $cond: ['$tracking', 1, 0] } }
                }
            },
            {
                $lookup:
                    {
                        from: 'comment',
                        localField: '_id',
                        foreignField: 'campaign',
                        as: 'comments'
                    }
            },
            {
                $unwind:
                    {
                        path: '$comments',
                        preserveNullAndEmptyArrays: true
                    }
            },
            matchUnwind,
            {
                $group:
                    {
                        _id: '$_id',
                        date: { $first: '$date' },
                        mailSent: { $first: '$mailSent' },
                        mailOpen: { $first: '$mailOpen' },
                        linkClick: { $sum: { $cond: { if: { $gte: ['$comments.step', 1] }, then: 1, else: 0 } } },
                        pageOne: { $sum: { $cond: { if: { $gte: ['$comments.step', 2] }, then: 1, else: 0 } } },
                        formValidated: { $sum: { $cond: { if: { $eq: ['$comments.step', 3] }, then: 1, else: 0 } } },
                        allowToContact: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ['$comments.accord', true] },
                                    then: 1,
                                    else: 0
                                }
                            }
                        },
                        commentsArray: { $push: '$comments.comment' },
                        commentsRejectedArray: { $push: '$comments.badwords' }
                    }
            },
            {
                $sort:
                    {
                        date: -1
                    }
            }
        ]).toArray();

        return docs.map(dataExposer.buildCommentsStats);
    };

    const computeSessionStats = async (name, codeINSEE) => {

        let sessionsReconciliees = db.collection('sessionsReconciliees');

        let [nbSessions, nbSessionsAvecAuMoinsUnAvis, nbSessionsAuMoinsTroisAvis] = await Promise.all([
            sessionsReconciliees.countDocuments({ region: codeINSEE }),
            sessionsReconciliees.countDocuments({ 'region': codeINSEE, 'score.nb_avis': { $gte: 1 } }),
            sessionsReconciliees.countDocuments({ 'region': codeINSEE, 'score.nb_avis': { $gte: 3 } })
        ]);

        return {
            region: name,
            nbSessions,
            nbSessionsAvecAuMoinsUnAvis,
            pourcentageDeSessionsAvecAuMoinsUnAvis: Math.ceil((nbSessionsAvecAuMoinsUnAvis * 100) / nbSessions),
            pourcentageDeSessionsAvecAuMoinsTroisAvis: Math.ceil((nbSessionsAuMoinsTroisAvis * 100) / nbSessions)
        };
    };

    const computeOrganismesStats = async (name, codeRegion) => {

        let organismes = db.collection('organismes');

        let [nbOrganimes, nbOrganismesAvecAvis, nbOrganismesActifs] = await Promise.all([
            organismes.countDocuments({ 'codeRegion': codeRegion }),
            organismes.countDocuments({ 'score.nb_avis': { $gte: 1 }, 'codeRegion': codeRegion }),
            organismes.countDocuments({ 'passwordHash': { $ne: null }, 'codeRegion': codeRegion }),
        ]);

        return {
            region: name,
            nbOrganimes,
            nbOrganismesActifs,
            nbOrganismesAvecAvis,
            pourcentageOrganismesAvecAuMoinsUnAvis: Math.ceil((nbOrganismesAvecAvis * 100) / nbOrganimes),
        };
    };

    router.get('/stats/sessions.:format', tryAndCatch(async (req, res) => {

        let { findRegionByCodeRegion } = regions(db);

        let sessions = await Promise.all(configuration.app.active_regions.map(ar => {
            let { name, codeINSEE } = findRegionByCodeRegion(ar.code_region);
            return computeSessionStats(name, codeINSEE);
        }));

        res.json(sessions);
    }));

    router.get('/stats/organismes.:format', tryAndCatch(async (req, res) => {

        let { findRegionByCodeRegion } = regions(db);

        let organismes = await Promise.all(configuration.app.active_regions.map(ar => {
            let { name } = findRegionByCodeRegion(ar.code_region);
            return computeOrganismesStats(name, ar.code_region);
        }));

        res.json(organismes);
    }));

    router.get('/stats/mailing.:format', async (req, res) => {

        let data = await computeCommentStats(req.query.codeRegion);
        if (req.params.format === 'json' || !req.params.format) {
            res.send(data);
        } else if (req.params.format === 'csv') {
            res.setHeader('Content-disposition', 'attachment; filename=stats.csv');
            res.setHeader('Content-Type', 'text/csv');
            let lines = 'Nom de la campagne;Date;Mails envoyés;Mails ouverts;Ouvertures de lien;Personnes ayant validé la page 1;Personnes ayant validé tout le questionnaire;Autorisations de contact;Commentaires;Commentaires rejetés\n';
            data.forEach(campaignStats => {
                campaignStats.date = moment(campaignStats.date).format('DD/MM/YYYY h:mm');
                let values = [];
                Object.keys(campaignStats).forEach(key => {
                    values.push(campaignStats[key]);
                });
                lines += values.join(';') + '\n';
            });
            res.send(lines);
        } else {
            res.status(404).render('errors/404');
        }
    });

    return router;
};
