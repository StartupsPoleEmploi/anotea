const express = require('express');
const tryAndCatch = require('../tryAndCatch');

module.exports = ({ db, authService }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = authService.createJWTAuthMiddleware('backoffice');

    router.get('/backoffice/financeur/region/:idregion/mailStats/:year/months', checkAuth, tryAndCatch(async (req, res) => {

        let codeFinanceur = req.query.codeFinanceur;

        let match = { '_id.codeRegion': req.params.idregion, '_id.year': parseInt(req.params.year) };
        let mailStatsCollection;
        if (codeFinanceur) {
            match = Object.assign(match, { '_id.codeFinanceur': codeFinanceur });
            mailStatsCollection = 'mailStatsByCodeFinanceur';
        } else {
            mailStatsCollection = 'mailStats';
        }

        let results = Array.from(Array(12).keys()).map(i => {
            return {
                _id: i,
                count: 0,
                countEmailOpen: 0,
                countAdvicesPublished: 0,
                countAdvicesWithComments: 0,
                countAdvicesPositif: 0,
                countAdvicesNegatif: 0,
                countAdvicesRejected: 0
            };
        });

        let stats = await db.collection(mailStatsCollection).aggregate([
            { $match:
                match
            },
            { $group:
                {
                    _id: '$_id.month',
                    count: { $sum: '$count' },
                    countEmailOpen: { $sum: '$countEmailOpen' },
                    countAdvicesPublished: { $sum: '$countAdvicesPublished' },
                    countAdvicesWithComments: { $sum: '$countAdvicesWithComments' },
                    countAdvicesPositif: { $sum: '$countAdvicesPositif' },
                    countAdvicesNegatif: { $sum: '$countAdvicesNegatif' },
                    countAdvicesRejected: { $sum: '$countAdvicesRejected' }
                }
            }
        ]).toArray();

        stats.forEach(item => {
            results[item._id] = item;
        });
        
        res.status(200).send(results);
    }));

    router.get('/backoffice/financeur/region/:idregion/mailStats/:year', checkAuth, tryAndCatch(async (req, res) => {

        let codeFinanceur = req.query.codeFinanceur;

        let match = { '_id.codeRegion': req.params.idregion, '_id.year': parseInt(req.params.year) };
        if (codeFinanceur) {
            match = Object.assign(match, { '_id.codeFinanceur': codeFinanceur });
        }

        let stats = await db.collection('mailStats').aggregate([
            { $match:
                match
            },
            { $group:
                {
                    _id: null,
                    count: { $sum: '$count' },
                    countEmailOpen: { $sum: '$countEmailOpen' },
                    countAdvicesPublished: { $sum: '$countAdvicesPublished' },
                    countAdvicesWithComments: { $sum: '$countAdvicesWithComments' },
                    countAdvicesPositif: { $sum: '$countAdvicesPositif' },
                    countAdvicesNegatif: { $sum: '$countAdvicesNegatif' },
                    countAdvicesRejected: { $sum: '$countAdvicesRejected' }
                }
            }
        ]).toArray();

        if (stats.length > 0) {
            let obj = stats[0];
            delete obj._id;
            res.status(200).send(obj);
        } else {
            res.status(200).send({});
        }
    }));

    return router;
};
