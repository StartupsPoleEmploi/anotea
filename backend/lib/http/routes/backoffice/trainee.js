const express = require('express');
const tryAndCatch = require('../tryAndCatch');

module.exports = ({ db, createJWTAuthMiddleware, logger, configuration, mailer }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = createJWTAuthMiddleware('backoffice');

    const PAGE_SIZE = 5;

    router.get('/backoffice/trainee/search', checkAuth, tryAndCatch(async (req, res) => {
        if (req.query.query === undefined || req.query.codeRegion === undefined) {
            return res.status(400).send({ error: true });
        }

        let currentPage = 0;
        if (!isNaN(req.query.page) && parseInt(req.query.page) >= 0) {
            currentPage = parseInt(req.query.page);
        } else if (req.query.page !== undefined && isNaN(req.query.page)) {
            return res.status(400).send({ error: true });
        }
        const regexp = { $regex: req.query.query, $options: 'i' };


        let match = {
            'codeRegion': req.query.codeRegion,
            'step': { $gte: 2 }
        };

        if (req.query.codeFinanceur !== undefined) {
            match['training.codeFinanceur'] = { $elemMatch: { $eq: req.query.codeFinanceur } };
        }

        const trainees = await db.collection('comment').aggregate([
            {
                $match: match
            },
            {
                $lookup: {
                    from: 'trainee',
                    localField: 'token',
                    foreignField: 'token',
                    as: 'fromTrainee'
                }
            },
            {
                $replaceRoot: {
                    newRoot: { $mergeObjects: [{ $arrayElemAt: ['$fromTrainee', 0] }, '$$ROOT'] }
                }
            },
            {
                $project: {
                    'trainee.email': 1,
                    'trainee.name': 1,
                    'trainee.firstName': 1,
                    'trainee.dnIndividuNational': 1,
                    'step': 1,
                    'rates': 1,
                    'pseudo': 1,
                    'comment': 1,
                    'reported': 1,
                    'moderated': 1,
                    'published': 1,
                    'rejected': 1,
                    'rejectReason': 1,
                    'qualification': 1
                }
            },
            {
                $match: {
                    $or: [
                        { 'trainee.email': regexp },
                        { 'trainee.name': regexp },
                        { 'trainee.firstName': regexp },
                        { 'trainee.dnIndividuNational': regexp },
                        { 'pseudo': regexp },
                        { 'comment.title': regexp },
                        { 'comment.text': regexp }
                    ]
                }
            },
            {
                $skip: PAGE_SIZE * currentPage
            },
            {
                $limit: PAGE_SIZE
            }
        ]).toArray();

        res.send(trainees);
    }));

    return router;
};
