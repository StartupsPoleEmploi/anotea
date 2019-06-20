const express = require('express');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    const getLatestStatistics = () => db.collection('statistics').find().limit(1).sort({ date: -1 }).toArray();

    router.get('/public-stats/organismes', tryAndCatch(async (req, res) => {
        let results = await getLatestStatistics();
        res.json(results[0].organismes);
    }));

    router.get('/public-stats/avis', tryAndCatch(async (req, res) => {
        let results = await getLatestStatistics();
        res.json(results[0].avis);
    }));

    return router;
};
