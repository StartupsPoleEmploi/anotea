const express = require('express');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ stats }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/public-stats/organismes', tryAndCatch(async (req, res) => {
        res.json(await stats.computeOrganismesStats());
    }));

    router.get('/public-stats/avis', tryAndCatch(async (req, res) => {
        res.json(await stats.computeAvisStats());
    }));

    return router;
};
