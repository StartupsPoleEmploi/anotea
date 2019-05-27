const express = require('express');
const moment = require('moment/moment');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ stats }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/stats/mailing.csv', tryAndCatch(async (req, res) => {

        let data = await stats.computeMailingStats(req.query.codeRegion, req.query.codeFinanceur);
        res.setHeader('Content-disposition', 'attachment; filename=stats.csv');
        res.setHeader('Content-Type', 'text/csv');
        let lines = 'Nom de la campagne;Date;Mails envoyés;Mails ouverts;Ouvertures de lien;Personnes ayant validé le questionnaire;Autorisations de contact;Commentaires;Commentaires rejetés\n';
        data.forEach(campaignStats => {
            campaignStats.date = moment(campaignStats.date).format('DD/MM/YYYY h:mm');
            let values = [];
            Object.keys(campaignStats).forEach(key => {
                values.push(campaignStats[key]);
            });
            lines += values.join(';') + '\n';
        });
        res.send(lines);
    }));

    return router;
};
