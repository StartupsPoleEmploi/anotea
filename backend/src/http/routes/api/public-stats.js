const express = require('express');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db, logger, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const { findActiveRegions } = regions;

    const getOrganismesStats = async (regionName, codeRegion) => {

        let organismes = db.collection('accounts');
        let filter = { 'profile': 'organisme', 'codeRegion': codeRegion };
        let [
                nbOrganimesContactes, 
                relances,
                ouvertureMails,
                // ouvertureLien,
                organismesActifs,
                // nbConnexion,
                // avisNonLus,
                // commentaireAvecReponse,
                // avisAvecReponse,
                // avisSignales 
                
            ] = await Promise.all([
            organismes.countDocuments({ 'mailSentDate': { $ne: null}, ...filter }),
            organismes.countDocuments({ 'resend': true, ...filter }),
            organismes.countDocuments({ 'tracking.firstRead': { $ne: null }, ...filter }),
            organismes.countDocuments({ 'passwordHash': { $ne: null }, ...filter }),
        ]);

        return {
            region: regionName,
            nbOrganismesContactes: nbOrganimesContactes,
            mailsEnvoyes: relances + nbOrganimesContactes,
            taux: {
                txOuvertureMails: `${Math.round((ouvertureMails * 100) / nbOrganimesContactes)}%`,
                txOrganismesActifs: `${Math.round((organismesActifs * 100) / nbOrganimesContactes)}%`,
            }
        };
    };

    router.get('/public-stats/organismes.json', tryAndCatch(async (req, res) => {

        let organismes = await Promise.all(findActiveRegions().map(async region => {
            return getOrganismesStats(region.nom, region.codeRegion);
        }));

        res.send(JSON.stringify(organismes, null, 4));
    }));

    return router;
};