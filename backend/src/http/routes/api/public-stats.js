const express = require('express');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db, logger, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const { findActiveRegions } = regions;

    const getOrganismesStats = async (regionName, codeRegion) => {

        let organismes = db.collection('accounts');
        let avis = db.collection('comment');
        let filter = { 'profile': 'organisme', codeRegion };
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
            region: regionName,
            nbOrganismesContactes: nbOrganimesContactes,
            mailsEnvoyes: relances + nbOrganimesContactes,
            taux: {
                txOuvertureMails: ouvertureMails && nbOrganimesContactes !== 0 ? `${Math.round((ouvertureMails * 100) / nbOrganimesContactes)}%` : 0,
                txOrganismesActifs: organismesActifs && nbOrganimesContactes !== 0 ? `${Math.round((organismesActifs * 100) / nbOrganimesContactes)}%` : 0,
                txAvisNonLus: avisNonLus && avisModeres !== 0 ? `${Math.round((avisNonLus * 100) / avisModeres)}%` : 0,
                txAvisAvecReponses: nbOrganismesReponses && avisModeres !==0 ? `${Math.round((nbOrganismesReponses * 100) / avisModeres)}%` : 0,
                txAvisSignales: avisSignales && avisModeres !== 0 ? `${Math.round((avisSignales * 100) / avisModeres)}%` : 0,
            }
        };
    };

    const getAvisStats = async (regionName, codeRegion) => {

        let avis = db.collection('trainee');
        let filter = { codeRegion };
        let [
                nbStagiairesContactes, 
                relances,
                nbMailsOuverts,
                nbLiensCliques,
            ] = await Promise.all([
                avis.countDocuments({ 'mailSent': true, 'mailRetry': 0, ...filter }),
                db.collection('trainee').aggregate([
                    {
                        $match: {
                            ...filter,
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: '$mailRetry' },
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            totalAmount: 1,
                        }
                    },
                ]).toArray(),
                avis.countDocuments({ 'tracking.firstRead': {$ne: null} ,...filter }),
                avis.countDocuments({ 'tracking.click': {$ne: null} ,...filter }),
        ]);
        let nbMailEnvoyes = relances.length > 0 ? (relances[0].totalAmount + nbStagiairesContactes) : 0;

        return {
            region: regionName,
            nbStagiairesContactes: nbStagiairesContactes,
            nbMailEnvoyes: nbMailEnvoyes,
            tauxOuvertureMail: nbMailsOuverts && nbMailEnvoyes !== 0 ? `${Math.round((nbMailsOuverts * 100) / nbMailEnvoyes)}%` : 0,
            tauxLiensCliques: nbLiensCliques && nbMailsOuverts !== 0 ? `${Math.round((nbLiensCliques * 100) / nbMailsOuverts)}%` : 0,
        };
    };

    router.get('/public-stats/organismes.json', tryAndCatch(async (req, res) => {

        let organismes = await Promise.all(findActiveRegions().map(async region => {
            return getOrganismesStats(region.nom, region.codeRegion);
        }));

        res.json(organismes);
    }));

    router.get('/public-stats/avis.json', tryAndCatch(async (req, res) => {

        let avis = await Promise.all(findActiveRegions().map(async region => {
            return getAvisStats(region.nom, region.codeRegion);
        }));

        res.json(avis);
    }));

    return router;
};
