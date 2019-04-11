const express = require('express');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db, logger, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const { findActiveRegions } = regions;

    const getOrganismesStats = async (regionName, codeRegion) => {

        let organismes = db.collection('accounts');
        let avis = db.collection('comment');
        let filter = { 'profile': 'organisme', 'codeRegion': codeRegion };
        let [
                nbOrganimesContactes, 
                relances,
                ouvertureMails,
                // ouvertureLien,
                organismesActifs,
                avisNonLus,
                avisModeres,
                nbOrganismesReponses,
                avisSignales 
                
            ] = await Promise.all([
            organismes.countDocuments({ 'mailSentDate': { $ne: null}, ...filter }),
            organismes.countDocuments({ 'resend': true, ...filter }),
            organismes.countDocuments({ 'mailSentDate': { $ne: null}, 'tracking.firstRead': { $ne: null }, ...filter }),
            organismes.countDocuments({ 'passwordHash': { $ne: null }, ...filter }),
            avis.countDocuments({ 'published': true, $or: [ {'read': false}, {'read': {$ne: true}} ], 'codeRegion': codeRegion }),
            avis.countDocuments({ 'moderated': true, 'rejected': false,'codeRegion': codeRegion }),
            avis.countDocuments({ 'answer': {$ne: null}, 'codeRegion': codeRegion }),
            avis.countDocuments({ 'reported': true, 'codeRegion': codeRegion }),
        ]);

        return {
            avisNonLus: avisNonLus,
            avisModeres: avisModeres,
            avisSignales: avisSignales,
            region: regionName,
            nbOrganismesContactes: nbOrganimesContactes,
            mailsEnvoyes: relances + nbOrganimesContactes,
            taux: {
                txOuvertureMails: ouvertureMails || nbOrganimesContactes !== 0 ? `${Math.round((ouvertureMails * 100) / nbOrganimesContactes)}%` : 0,
                txOrganismesActifs: organismesActifs || nbOrganimesContactes !== 0 ? `${Math.round((organismesActifs * 100) / nbOrganimesContactes)}%` : 0,
                txAvisNonLus: avisNonLus || avisModeres !== 0 ? `${Math.round((avisNonLus * 100) / avisModeres)}%` : 0,
                txAvisAvecReponses: nbOrganismesReponses || avisModeres !==0 ? `${Math.round((nbOrganismesReponses * 100) / avisModeres)}%`: 0,
                txAvisSignales: avisSignales || avisModeres !== 0 ? `${Math.round((avisSignales * 100) / avisModeres)}%`: 0,
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