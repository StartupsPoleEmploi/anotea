const express = require('express');
const moment = require('moment');
const { encodeStream } = require('iconv-lite');
const Boom = require('boom');
const { tryAndCatch } = require('./routes-utils');
const { jsonStream, transformObject } = require('../../common/utils/stream-utils');

const financeurs = {
    '0': 'Autre',
    '1': 'Code(s) obsolète(s)',
    '10': 'Bénéficiaire de l\'action',
    '11': 'Etat - Ministère chargé de l\'emploi',
    '12': 'Etat - Ministère de l\'éducation nationale',
    '13': 'Etat - Autre',
    '14': 'Fonds européens - Autre',
    '15': 'Collectivité territoriale - Autre',
    '16': 'OPCA',
    '17': 'OPACIF',
    '2': 'Collectivité territoriale - Conseil régional',
    '3': 'Fonds européens - FSE',
    '4': 'Pôle emploi',
    '5': 'Entreprise',
    '6': 'ACSÉ (anciennement FASILD)',
    '7': 'AGEFIPH',
    '8': 'Collectivité territoriale - Conseil général',
    '9': 'Collectivité territoriale - Commune',
};

const findLabelByCodeFinanceur = code => financeurs[code];

module.exports = ({ db, configuration, logger, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const { findRegionByCodeRegion } = regions;

    const computeMailingStats = async (codeRegion, codeFinanceur) => {

        const docs = await db.collection('trainee').aggregate([
            {
                $match: {
                    ...(codeRegion ? { codeRegion: codeRegion } : {}),
                    ...(codeFinanceur ? { 'training.codeFinanceur': { $elemMatch: { $eq: codeFinanceur } } } : {})
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

        return docs.map(doc => {
            doc.comments = 0;
            for (let idx in doc.commentsArray) {
                if (doc.commentsArray[idx] !== null &&
                    (doc.commentsArray[idx].title !== '' || doc.commentsArray[idx].text !== '')) {
                    doc.comments++;
                }
            }
            doc.commentsRejected = doc.commentsRejectedArray.length;
            delete doc.commentsArray;
            delete doc.commentsRejectedArray;
            return doc;
        });
    };

    const computeSessionStats = async (regionName, codeRegions) => {

        let sessionsReconciliees = db.collection('sessionsReconciliees');

        let [nbSessions, nbSessionsAvecAuMoinsUnAvis, nbSessionsAuMoinsTroisAvis, nbAvis, restituables] = await Promise.all([
            sessionsReconciliees.countDocuments({ 'code_region': { $in: codeRegions } }),
            sessionsReconciliees.countDocuments({ 'code_region': { $in: codeRegions }, 'score.nb_avis': { $gte: 1 } }),
            sessionsReconciliees.countDocuments({ 'code_region': { $in: codeRegions }, 'score.nb_avis': { $gte: 3 } }),
            db.collection('comment').countDocuments({ codeRegion: { $in: codeRegions }, step: { $gte: 2 } }),
            db.collection('sessionsReconciliees').aggregate([
                {
                    $match: {
                        code_region: { $in: codeRegions },
                    }
                },
                {
                    $unwind: '$avis'
                },
                {
                    $group: {
                        _id: '$avis._id',
                    }
                },
                {
                    $count: 'nbAvisRestituables'
                }
            ]).toArray()
        ]);

        return {
            region: regionName,
            sessionsAvecAuMoinsUnAvis: `${Math.ceil((nbSessionsAvecAuMoinsUnAvis * 100) / nbSessions)}%`,
            sessionsAvecAuMoinsTroisAvis: `${Math.ceil((nbSessionsAuMoinsTroisAvis * 100) / nbSessions)}%`,
            avisRestituables: restituables.length > 0 ? `${Math.ceil((restituables[0].nbAvisRestituables * 100) / nbAvis)}%` : 0,
            meta: {
                nbSessions,
                nbSessionsAvecAuMoinsUnAvis,
                nbAvis,
            },
        };
    };

    const computeOrganismesStats = async (regionName, codeRegion) => {

        let organismes = db.collection('accounts');

        let [nbOrganimes, nbOrganismesAvecAvis, nbOrganismesActifs] = await Promise.all([
            organismes.countDocuments({ 'profile': 'organisme', 'codeRegion': codeRegion }),
            organismes.countDocuments({ 'profile': 'organisme', 'score.nb_avis': { $gte: 1 }, 'codeRegion': codeRegion }),
            organismes.countDocuments({ 'profile': 'organisme', 'passwordHash': { $ne: null }, 'codeRegion': codeRegion }),
        ]);

        return {
            region: regionName,
            organismesAvecAuMoinsUnAvis: `${Math.ceil((nbOrganismesAvecAvis * 100) / nbOrganimes)}%`,
            meta: {
                nbOrganimes,
                nbOrganismesActifs,
                nbOrganismesAvecAvis,
            }
        };
    };

    router.get('/stats/sessions.:format', tryAndCatch(async (req, res) => {

        let sessions = await Promise.all(configuration.app.active_regions.map(async ar => {
            return computeSessionStats(ar.name, [ar.code_region]);
        }));

        sessions.push(await computeSessionStats('Toutes', configuration.app.active_regions.map(ar => ar.code_region)));

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

        let data = await computeMailingStats(req.query.codeRegion, req.query.codeFinanceur);
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
