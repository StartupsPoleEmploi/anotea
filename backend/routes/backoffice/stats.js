const express = require('express');
const tryAndCatch = require('../tryAndCatch');

module.exports = ({ db, authService }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = authService.createJWTAuthMiddleware('backoffice');

    router.get('/backoffice/financeur/region/:idregion/mailStats/:year/months', tryAndCatch(async (req, res) => {

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
        
        res.status(200).send(stats);
    }));

    router.get('/backoffice/financeur/region/:idregion/mailStats/:year', tryAndCatch(async (req, res) => {

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

        let obj = stats[0];
        delete obj._id;
        
        res.status(200).send(obj);
    }));

    return router;
};
