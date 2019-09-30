const express = require('express');
const moment = require('moment/moment');
const { tryAndCatch, sendCSVStream } = require('../routes-utils');

module.exports = ({ db }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/exports/mailing.csv', tryAndCatch((req, res) => {

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
                        as: 'stats'
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
            ]).stream();
        };

        let stream = computeMailingStats(req.query.codeRegion, req.query.codeFinanceur);

        return sendCSVStream(stream, res, {
            'Nom de la campagne': stats => stats._id,
            'Date': stats => moment(stats.date).format('DD/MM/YYYY h:mm'),
            'Mails envoyés': stats => stats.mailSent,
            'Mails ouverts': stats => stats.mailOpen,
            'Ouvertures de lien': stats => stats.linkClick,
            'Personnes ayant validé le questionnaire': stats => stats.formValidated,
            'Autorisations de contact': stats => stats.allowToContact,
            'Commentaires': stats => stats.nbCommentaires,
            'Commentaires rejetés': stats => stats.nbCommentairesRejected,
        }, { filename: 'mailing.csv' });

    }));

    router.get('/exports/domainMailing.csv', tryAndCatch(async (req, res) => {

        let stream = await db.collection('domainMailStats').find().stream();

        return sendCSVStream(stream, res, {
            'Nom de la campagne': doc => doc._id.campaign,
            'Nom de domaine': doc => doc._id.domain,
            'Nombre d\'email': doc => doc.count,
            'Nombre d\'email ouverts': doc => doc.mailOpen,
            'Taux d\'ouverture': doc => doc.rate,
        }, { filename: 'domainMailing.csv' });
    }));

    router.get('/exports/bo-organismes.csv', tryAndCatch((req, res) => {

        const computeBoStats = () => {

            return db.collection('events').aggregate([
                {
                    $group: {
                        _id: '$source.user',
                        loginCount: { $sum: { $cond: { if: { $eq: ['$type', 'login'] }, then: 1, else: 0 } } },
                        loginWithTokenCount: { $sum: { $cond: { if: { $eq: ['$type', 'login-access-token'] }, then: 1, else: 0 } } },
                        reponseCount: { $sum: { $cond: { if: { $eq: ['$type', 'reponse'] }, then: 1, else: 0 } } },
                        reportCount: { $sum: { $cond: { if: { $eq: ['$type', 'report'] }, then: 1, else: 0 } } },
                        readCount: { $sum: { $cond: { if: { $eq: ['$type', 'markAsRead'] }, then: 1, else: 0 } } }
                    },
                },
                {
                    $lookup: {
                        from: 'comment',
                        localField: '_id',
                        foreignField: 'training.organisation.siret',
                        as: 'avis'
                    }
                }
            ]).stream();
        };

        let stream = computeBoStats();

        return sendCSVStream(stream, res, {
            'SIRET': stats => stats._id,
            'Nombre de connexions': stats => stats.loginCount + stats.loginWithTokenCount,
            'Nombre d\'avis ': stats => stats.avis.length,
            'Nombre d\'avis répondus': stats => stats.reponseCount,
            'Nombre d\'avis signalés': stats => stats.reportCount,
            'Nombre d\'avis Lus': stats => stats.readCount,
        }, { filename: `bo-organismes-${moment().format('YYYY-MM-DD')}.csv` });

    }));

    return router;
};
