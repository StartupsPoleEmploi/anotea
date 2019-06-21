const express = require('express');
const moment = require('moment/moment');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    const computeMailingStats = (codeRegion, codeFinanceur) => {

        return db.collection('trainee').aggregate([
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
                    mailOpen: { $sum: { $cond: ['$tracking.firstRead', 1, 0] } },
                    linkClick: { $sum: { $cond: ['$tracking.click', 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: 'comment',
                    let: {
                        campaign: '$_id',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$campaign', '$$campaign'] },
                                        //hack to return a valid expression when codeRegion is empty
                                        codeRegion ? { $eq: ['$codeRegion', codeRegion] } : { $eq: ['$campaign', '$$campaign'] },
                                    ]
                                },
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                nbAvis: { $sum: 1 },
                                nbCommentaires: {
                                    $sum: {
                                        $cond: {
                                            if: { $not: ['$comment'] },
                                            then: 0,
                                            else: 1,
                                        }
                                    }
                                },
                                nbCommentairesRejected: {
                                    $sum: {
                                        $cond: {
                                            if: { $eq: ['$rejected', true] },
                                            then: 1,
                                            else: 0,
                                        }
                                    }
                                },
                                allowToContact: {
                                    $sum: {
                                        $cond: {
                                            if: { $eq: ['$accord', true] },
                                            then: 1,
                                            else: 0
                                        }
                                    }
                                },
                            }
                        },
                    ],
                    as: 'stats-routes.js'
                }
            },
            {
                $unwind:
                    {
                        path: '$stats',
                        preserveNullAndEmptyArrays: true
                    }
            },
            {
                $group: {
                    _id: '$_id',
                    date: { $first: '$date' },
                    mailSent: { $first: '$mailSent' },
                    mailOpen: { $first: '$mailOpen' },
                    linkClick: { $first: '$linkClick' },
                    formValidated: { $first: '$stats.nbAvis' },
                    allowToContact: { $first: '$stats.allowToContact' },
                    nbCommentaires: { $first: '$stats.nbCommentaires' },
                    nbCommentairesRejected: { $first: '$stats.nbCommentairesRejected' },
                }
            },
            {
                $sort: {
                    date: -1
                }
            }
        ]).toArray();
    };


    router.get('/export/mailing.csv', tryAndCatch(async (req, res) => {

        let data = await computeMailingStats(req.query.codeRegion, req.query.codeFinanceur);
        res.setHeader('Content-disposition', 'attachment; filename=stats.csv');
        res.setHeader('Content-Type', 'text/csv');
        let lines = 'Nom de la campagne;Date;Mails envoyés;Mails ouverts;Ouvertures de lien;Personnes ayant validé le questionnaire;Autorisations de contact;Commentaires;Commentaires rejetés\n';
        data.forEach(campaignStats => {
            campaignStats.date = moment(campaignStats.date).format('DD/MM/YYYY h:mm');
            let values = [];
            Object.keys(campaignStats).forEach(key => {
                values.push(campaignStats[key]);
            });
            lines += values.join(';') + '\n';
        });
        res.send(lines);
    }));

    router.get('/export/domainMailing.csv', tryAndCatch(async (req, res) => {

        let data = await db.collection('domainMailStats').find().toArray();
        res.setHeader('Content-disposition', 'attachment; filename=domainMailing.csv');
        res.setHeader('Content-Type', 'text/csv');
        let lines = 'Nom de la campagne;Nom de domaine;Nombre d\'email;Nombre d\'email ouverts;Taux d\'ouverture\n';
        data.forEach(stats => {
            let values = `${stats._id.campaign};${stats._id.domain};${stats.count};${stats.mailOpen};${stats.rate}`;
            lines += values + '\n';
        });
        res.send(lines);
    }));

    return router;
};
