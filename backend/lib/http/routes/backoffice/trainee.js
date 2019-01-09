const express = require('express');
const Joi = require('joi');
const tryAndCatch = require('../tryAndCatch');

module.exports = ({ db, createJWTAuthMiddleware, logger, configuration, mailer }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = createJWTAuthMiddleware('backoffice');

    const PAGE_SIZE = 5;
    const POLE_EMPLOI = '4';

    router.get('/backoffice/trainee/search', checkAuth, tryAndCatch(async (req, res) => {
        const parameters = await Joi.validate(req.query, {
            query: Joi.string().required(),
            page: Joi.number().min(0)
        },
        { abortEarly: false });

        let currentPage = 0;
        if (parameters.page !== undefined) {
            currentPage = parameters.page;
        }
        const regexp = { $regex: parameters.query, $options: 'i' };

        let match = {
            'codeRegion': req.user.codeRegion,
            'step': { $gte: 2 }
        };

        if (req.user.codeFinanceur !== POLE_EMPLOI) {
            match['training.codeFinanceur'] = { $elemMatch: { $eq: req.user.codeFinanceur } };
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
