const express = require('express');
const moment = require('moment/moment');
const { tryAndCatch, sendCSVStream } = require('../routes-utils');

module.exports = ({ db }) => {

    const router = express.Router(); // eslint-disable-line new-cap

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
