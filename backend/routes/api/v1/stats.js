const express = require('express');
const moment = require('moment');

module.exports = db => {

    const router = express.Router(); // eslint-disable-line new-cap
    const dataExposer = require('../../../components/dataExposer')();

    router.get('/v1/stats.:format', async (req, res) => {

        let match = { $match: {} };
        let matchUnwind = { $match: {} };

        if (req.query.codeRegion !== undefined) {
            match = {
                '$match': {
                    'codeRegion': req.query.codeRegion
                }
            };

            matchUnwind = {
                '$match': {
                    'comments.codeRegion': req.query.codeRegion
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

        const data = docs.map(dataExposer.buildCommentsStats);
        if (req.params.format === 'json') {
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
