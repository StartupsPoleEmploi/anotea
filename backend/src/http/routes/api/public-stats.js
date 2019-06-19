const express = require('express');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const { findActiveRegions } = regions;
    const avis = db.collection('comment');
    const organismes = db.collection('accounts');
    const trainee = db.collection('trainee');

    const calculateRate = (dividend, divisor) => {
        if (dividend && divisor !== 0) {
            return (Math.round((dividend * 100) / divisor) + '%');
        } else {
            return (0 + '%');
        }
    };

    const getOrganismesStats = async (regionName, codeRegions) => {

        let filter = { codeRegion: { $in: codeRegions } };
        let [
            nbOrganimesContactes,
            nbRelances,
            ouvertureMails,
            nbClicDansLien,
            organismesActifs,
            avisNonLus,
            avisModeresNonRejetes,
            nbCommentairesAvecOrganismesReponses,
            nbAvisAvecOrganismesReponses,
            avisSignales
        ] = await Promise.all([
            organismes.countDocuments({ 'mailSentDate': { $ne: null }, 'profile': 'organisme', ...filter }),
            organismes.countDocuments({ 'resend': true, 'profile': 'organisme', ...filter }),
            organismes.countDocuments({
                'mailSentDate': { $ne: null },
                'tracking.firstRead': { $ne: null },
                'profile': 'organisme', ...filter
            }),
            organismes.countDocuments({ 'tracking.click': { $ne: null }, 'profile': 'organisme', ...filter }),
            organismes.countDocuments({
                'mailSentDate': { $ne: null },
                'passwordHash': { $ne: null },
                'profile': 'organisme', ...filter
            }),
            avis.countDocuments({
                'published': true,
                '$or': [{ 'read': false }, { 'read': { $ne: true } }], ...filter
            }),
            avis.countDocuments({ 'moderated': true, 'rejected': false, ...filter }),
            avis.countDocuments({ 'answer': { $ne: null }, 'comment': { $ne: null }, ...filter }),
            avis.countDocuments({ 'answer': { $ne: null }, ...filter }),
            avis.countDocuments({ 'reported': true, ...filter }),
        ]);

        return {
            regionName: regionName,
            nbOrganismesContactes: nbOrganimesContactes,
            mailsEnvoyes: nbRelances + nbOrganimesContactes,
            tauxOuvertureMails: calculateRate(ouvertureMails, nbOrganimesContactes),
            tauxClicDansLien: calculateRate(nbClicDansLien, ouvertureMails),
            tauxOrganismesActifs: calculateRate(organismesActifs, nbOrganimesContactes),
            tauxAvisNonLus: calculateRate(avisNonLus, avisModeresNonRejetes),
            tauxCommentairesAvecReponses: calculateRate(nbCommentairesAvecOrganismesReponses, avisModeresNonRejetes),
            tauxAvisAvecReponses: calculateRate(nbAvisAvecOrganismesReponses, avisModeresNonRejetes),
            tauxAvisSignales: calculateRate(avisSignales, avisModeresNonRejetes),
        };
    };

    const getAvisStats = async (regionName, codeRegions) => {

        let filter = { codeRegion: { $in: codeRegions } };

        let [
            nbStagiairesContactes,
            nbRelances,
            nbMailsOuverts,
            nbLiensCliques,
            nbQuestionnairesValidees,
            nbAvisAvecCommentaire,
            nbCommentairesAModerer,
            nbCommentairesPositifs,
            nbCommentairesNegatifs,
            nbCommentairesRejetes
        ] = await Promise.all([
            trainee.countDocuments({ 'mailSent': true, ...filter }),
            db.collection('trainee').aggregate([
                { $match: { ...filter } },
                {
                    $group: {
                        _id: null,
                        nbRetries: { $sum: '$mailRetry' },
                    }
                },
            ]).toArray(),
            trainee.countDocuments({ 'tracking.firstRead': { $ne: null }, ...filter }),
            trainee.countDocuments({ 'tracking.click': { $ne: null }, ...filter }),
            trainee.countDocuments({ 'avisCreated': true, ...filter }),
            avis.countDocuments({ 'comment': { $ne: null }, ...filter }),
            avis.countDocuments({ 'comment': { $ne: null }, 'moderated': { $ne: true }, ...filter }),
            avis.countDocuments({ 'comment': { $ne: null }, 'qualification': 'positif', ...filter }),
            avis.countDocuments({ 'comment': { $ne: null }, 'qualification': 'négatif', ...filter }),
            avis.countDocuments({ 'rejected': true, ...filter })
        ]);

        let nbMailEnvoyes = nbRelances.length > 0 ? (nbRelances[0].nbRetries + nbStagiairesContactes) : 0;
        return {
            regionName: regionName,
            nbStagiairesContactes: nbStagiairesContactes,
            nbMailEnvoyes: nbMailEnvoyes,
            tauxOuvertureMail: calculateRate(nbMailsOuverts, nbMailEnvoyes),
            tauxLiensCliques: calculateRate(nbLiensCliques, nbMailsOuverts),
            tauxQuestionnairesValides: calculateRate(nbQuestionnairesValidees, nbLiensCliques),
            tauxAvisDeposes: calculateRate(nbQuestionnairesValidees, nbStagiairesContactes),
            tauxAvisAvecCommentaire: calculateRate(nbAvisAvecCommentaire, nbQuestionnairesValidees),
            nbCommentairesAModerer: nbCommentairesAModerer,
            tauxAvisPositifs: calculateRate(nbCommentairesPositifs, nbAvisAvecCommentaire),
            tauxAvisNegatifs: calculateRate(nbCommentairesNegatifs, nbAvisAvecCommentaire),
            tauxAvisRejetes: calculateRate(nbCommentairesRejetes, nbAvisAvecCommentaire),
        };
    };

    router.get('/public-stats/organismes', tryAndCatch(async (req, res) => {

        let regions = findActiveRegions();
        let organismes = await Promise.all([
            getOrganismesStats('Toutes', regions.map(region => region.codeRegion)),
            ...regions.map(region => getOrganismesStats(region.nom, [region.codeRegion])),
        ]);

        res.json(organismes);
    }));

    router.get('/public-stats/avis', tryAndCatch(async (req, res) => {

        let regions = findActiveRegions();
        let avis = await Promise.all([
            getAvisStats('Toutes', regions.map(region => region.codeRegion)),
            ...regions.map(region => getAvisStats(region.nom, [region.codeRegion])),
        ]);

        res.json(avis);
    }));

    return router;
};
