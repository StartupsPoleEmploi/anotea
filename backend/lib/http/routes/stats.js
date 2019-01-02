const express = require('express');
const moment = require('moment');
const { encodeStream } = require('iconv-lite');
const Boom = require('boom');
const { tryAndCatch } = require('./routes-utils');
const { jsonStream, transformObject } = require('../../common/stream-utils');
const { findLabelByCodeFinanceur } = require('../../common/components/financeurs');

module.exports = ({ db, configuration, logger, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const dataExposer = require('./dataExposer')();
    const { findRegionByCodeRegion } = regions;

    const computeMailingStats = async codeRegion => {

        const docs = await db.collection('trainee').aggregate([
            {
                $match: {
                    ...(codeRegion ? { codeRegion: codeRegion } : {}),
                }
            },
            {
                $group: {
                    _id: '$campaign',
                    date: { $min: '$mailSentDate' },
                    mailSent: { $sum: { $cond: ['$mailSent', 1, 0] } },
                    mailOpen: { $sum: { $cond: ['$tracking', 1, 0] } },
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
            {
                $match: {
                    ...(codeRegion ? { 'comments.codeRegion': codeRegion } : {}),
                }
            },
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

    const computeSessionStats = async (regionName, codeINSEE) => {

        let sessionsReconciliees = db.collection('sessionsReconciliees');

        let [nbSessions, nbSessionsAvecAuMoinsUnAvis, nbSessionsAuMoinsTroisAvis] = await Promise.all([
            sessionsReconciliees.countDocuments({ region: codeINSEE }),
            sessionsReconciliees.countDocuments({ 'region': codeINSEE, 'score.nb_avis': { $gte: 1 } }),
            sessionsReconciliees.countDocuments({ 'region': codeINSEE, 'score.nb_avis': { $gte: 3 } })
        ]);

        return {
            region: regionName,
            nbSessions,
            nbSessionsAvecAuMoinsUnAvis,
            pourcentageDeSessionsAvecAuMoinsUnAvis: Math.ceil((nbSessionsAvecAuMoinsUnAvis * 100) / nbSessions),
            pourcentageDeSessionsAvecAuMoinsTroisAvis: Math.ceil((nbSessionsAuMoinsTroisAvis * 100) / nbSessions)
        };
    };

    const computeOrganismesStats = async (regionName, codeRegion) => {

        let organismes = db.collection('organismes');

        let [nbOrganimes, nbOrganismesAvecAvis, nbOrganismesActifs] = await Promise.all([
            organismes.countDocuments({ 'codeRegion': codeRegion }),
            organismes.countDocuments({ 'score.nb_avis': { $gte: 1 }, 'codeRegion': codeRegion }),
            organismes.countDocuments({ 'passwordHash': { $ne: null }, 'codeRegion': codeRegion }),
        ]);

        return {
            region: regionName,
            nbOrganimes,
            nbOrganismesActifs,
            nbOrganismesAvecAvis,
            pourcentageOrganismesAvecAuMoinsUnAvis: Math.ceil((nbOrganismesAvecAvis * 100) / nbOrganimes),
        };
    };

    router.get('/stats/sessions.:format', tryAndCatch(async (req, res) => {

        let sessions = await Promise.all(configuration.app.active_regions.map(async ar => {
            let { nom, codeINSEE } = await findRegionByCodeRegion(ar.code_region);
            return computeSessionStats(nom, codeINSEE);
        }));

        res.json(sessions);
    }));

    router.get('/stats/organismes.:format', tryAndCatch(async (req, res) => {

        let organismes = await Promise.all(configuration.app.active_regions.map(async ar => {
            let { nom } = await findRegionByCodeRegion(ar.code_region);
            return computeOrganismesStats(nom, ar.code_region);
        }));

        res.json(organismes);
    }));

    router.get('/stats/mailing.:format', async (req, res) => {

        let data = await computeMailingStats(req.query.codeRegion);
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

    router.get('/stats/stagiaires/ventilation.:format', tryAndCatch(async (req, res) => {

        let stream = db.collection('trainee').aggregate([
            {
                $group: {
                    _id: {
                        campaign: '$campaign',
                        codeFinanceurs: '$training.codeFinanceur',
                        codeRegion: '$codeRegion',
                    },
                    nbStagiaires: { $sum: 1 },
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        campaign: '$_id.campaign',
                        codeRegion: '$_id.codeRegion',
                        codeFinanceurs: '$_id.codeFinanceurs',
                        nbStagiaires: '$nbStagiaires',
                    }
                }
            },
        ]);

        let handleError = e => {
            logger.error('An error occurred', e);
            res.status(500);
            stream.push(Boom.boomify(e).output.payload);
        };

        if (req.params.format === 'json' || !req.params.format) {

            res.setHeader('Content-Type', 'application/json');
            stream
            .on('error', handleError)
            .pipe(jsonStream())
            .pipe(res);

        } else if (req.params.format === 'csv') {

            res.setHeader('Content-disposition', 'attachment; filename=stats-stagiaires-ventilation.csv');
            res.setHeader('Content-Type', 'text/csv; charset=iso-8859-1');
            res.write(`Campagne;Libelle Region;Code Region;Libelle Financeur;Code Financeur;Nombre de stagiaires\n`);

            stream
            .on('error', handleError)
            .pipe(transformObject(async doc => {
                let { campaign, codeRegion, codeFinanceurs, nbStagiaires } = doc;
                let libelleFinanceurs = codeFinanceurs.map(code => findLabelByCodeFinanceur(code) || 'Inconnu').join(',');
                let libelleRegion = await findRegionByCodeRegion(codeRegion).name;
                return `"${campaign}";"${libelleRegion}";="${codeRegion}";"${libelleFinanceurs}";="${codeFinanceurs}";"${nbStagiaires}"\n`;
            }))
            .pipe(encodeStream('UTF-16BE'))
            .pipe(res);
        } else {
            throw Boom.badRequest('Format invalide');
        }
    }));

    return router;
};
