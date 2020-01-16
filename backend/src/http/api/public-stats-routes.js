const express = require('express');
const moment = require('moment');
const Joi = require('joi');
const { tryAndCatch } = require('../utils/routes-utils');

module.exports = ({ db }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    const getRegionalStats = async parameters => {

        let res = await db.collection('statistics').aggregate([
            {
                $match: {
                    $and: [
                        { date: { $gte: moment(parameters.startDate).toDate() } },
                        { date: { $lte: moment(parameters.endDate).toDate() } },
                    ]
                },
            },
            {
                $project: {
                    date: 1,
                    avis: 1,
                },
            },
            {
                $unwind: '$avis'
            },
            {
                $group: {
                    _id: '$avis.label',
                    label: { $first: '$avis.label' },
                    codeRegions: { $first: '$avis.codeRegions' },
                    nbStagiairesImportes: { $push: { value: '$avis.nbStagiairesImportes', date: '$date' } },
                    nbStagiairesContactes: { $push: { value: '$avis.nbStagiairesContactes', date: '$date' } },
                    nbMailEnvoyes: { $push: { value: '$avis.nbMailEnvoyes', date: '$date' } },
                    nbMailsOuverts: { $push: { value: '$avis.nbMailsOuverts', date: '$date' } },
                    nbQuestionnairesValidees: { $push: { value: '$avis.nbQuestionnairesValidees', date: '$date' } },
                    nbLiensCliques: { $push: { value: '$avis.nbLiensCliques', date: '$date' } },
                    nbAvisAvecCommentaire: { $push: { value: '$avis.nbAvisAvecCommentaire', date: '$date' } },
                    nbCommentairesAModerer: { $push: { value: '$avis.nbCommentairesAModerer', date: '$date' } },
                    nbCommentairesPositifs: { $push: { value: '$avis.nbCommentairesPositifs', date: '$date' } },
                    nbCommentairesNegatifs: { $push: { value: '$avis.nbCommentairesNegatifs', date: '$date' } },
                    nbCommentairesRejetes: { $push: { value: '$avis.nbCommentairesRejetes', date: '$date' } },
                },
            },
        ]).toArray();

        if (res.length === 0) {
            return {};
        }


        let national = res.find(r => r.label === 'Toutes');
        let regional = res.find(r => r.codeRegions.length === 1 && r.codeRegions[0] === parameters.codeRegion);

        return {
            ...regional,
            meta: {
                national: Object.keys(national).reduce((acc, key) => {
                    if (key.startsWith('nb')) {
                        acc[key] = national[key].map(({ date, value }) => {
                            let nbRegionsWithStats = res.length - 1;
                            return {
                                date,
                                value: Number(Math.round((value / nbRegionsWithStats) + 'e0') + 'e-0'),
                            };
                        });
                    } else {
                        acc[key] = national[key];
                    }

                    return acc;
                }, {}),
            }
        };
    };

    router.get('/api/stats', tryAndCatch(async (req, res) => {

        let parameters = await Joi.validate(req.query, {
            codeRegion: Joi.string().default('11'),
            startDate: Joi.number().default(moment().subtract(1, 'months').startOf('month').subtract(1, 'days').valueOf()),
            endDate: Joi.number().default(moment().valueOf()),
        }, { abortEarly: false });

        let stats = await getRegionalStats(parameters);

        res.json(stats);
    }));

    return router;
};
