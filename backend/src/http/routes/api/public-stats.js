const express = require('express');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    const getLatestStatistics = async () => {
        let res = await db.collection('statistics').find().limit(1).sort({ date: -1 }).toArray();
        return res.length > 0 ? res[0] : {};
    };

    router.get('/public-stats/latest', tryAndCatch(async (req, res) => {
        let stats = await getLatestStatistics();
        res.json(stats);
    }));

    return router;
};
