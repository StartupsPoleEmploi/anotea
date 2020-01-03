const express = require('express');
const { tryAndCatch } = require('../utils/routes-utils');

module.exports = ({ regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/api/regions', tryAndCatch(async (req, res) => {
        let regionList = regions.findActiveRegions().map(region => {
            return {
                codeRegion: region.codeRegion,
                nom: region.nom,
                email: `${region.contact}@pole-emploi.fr`
            };
        }).sort((a, b) => {
            return a.nom.localeCompare(b.nom);
        });

        regionList.push({
            codeRegion: null,
            nom: 'Autre région',
            email: 'anotea@anotea.pole-emploi.fr'
        });

        res.json(regionList);
    }));

    return router;
};
