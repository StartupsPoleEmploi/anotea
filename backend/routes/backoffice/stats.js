const express = require('express');
const tryAndCatch = require('../tryAndCatch');

module.exports = (db, authService, logger, configuration) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = authService.createJWTAuthMiddleware('backoffice');

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
                    _id: '$_id.month',
                    count: { $sum: '$count' },
                    countOpen: { $sum: '$count' },
                    countAdvices: { $sum: '$count' },
                    countAdvicesPositif: { $sum: '$count' },
                    countAdvicesNegatif: { $sum: '$count' },
                    countAdvicesRejected: { $sum: '$count' }
                }
            }
        ]).toArray();
        
        res.status(200).send(stats);
    }));

    return router;
};
