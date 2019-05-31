const express = require('express');
const moment = require('moment/moment');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db, stats }) => {

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

    router.get('/stats/domainMailing.csv', tryAndCatch(async (req, res) => {

        let data = await db.collection('domainMailStats').find().toArray();
        res.setHeader('Content-disposition', 'attachment; filename=domainMailing.csv');
        res.setHeader('Content-Type', 'text/csv');
        let lines = 'Nom de la campagne;Nom de domaine;Nombre d\'email;Nombre d\'email ouverts;Taux d\'ouverture\n';
        data.forEach(stats => {
            let values = `${stats._id.campaign};${stats._id.domain};${stats.count};${stats.mailOpen};${stats.rate}`;
            lines += values + '\n';
        });
        res.send(lines);
    }));

    return router;
};
