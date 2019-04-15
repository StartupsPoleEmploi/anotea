const express = require('express');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db, logger, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const { findActiveRegions } = regions;

    const calculateRate = (dividend, divisor) => {
        if (dividend && divisor !== 0) {
            return (Math.round((dividend * 100) / divisor) + '%');
        } else {
            return (0 + '%');
        }
    };

    const getOrganismesStats = async (regionName, codeRegion) => {

        let organismes = db.collection('accounts');
        let avis = db.collection('comment');
        let filter = { 'profile': 'organisme', codeRegion };
        let [
                nbOrganimesContactes, 
                relances,
                ouvertureMails,
                nbClicDansLien,
                organismesActifs,
                avisNonLus,
                avisModeresNonRejetes,
                nbCommentairesAvecOrganismesReponses,
                nbAvisAvecOrganismesReponses,
                avisSignales
            ] = await Promise.all([
            organismes.countDocuments({ 'mailSentDate': { $ne: null }, ...filter }),
            organismes.countDocuments({ 'resend': true, ...filter }),
            organismes.countDocuments({ 'mailSentDate': { $ne: null }, 'tracking.firstRead': { $ne: null }, ...filter }),
            organismes.countDocuments({ 'tracking.click': { $ne: null }, ...filter }),
            organismes.countDocuments({ 'passwordHash': { $ne: null }, ...filter }),
            avis.countDocuments({ 'published': true, $or: [ { 'read': false }, {'read': { $ne: true }} ], codeRegion }),
            avis.countDocuments({ 'moderated': true, 'rejected': false, 'codeRegion': codeRegion }),
            avis.countDocuments({ 'answer': { $ne: null }, 'comment': { $ne: null }, codeRegion }),
            avis.countDocuments({ 'answer': { $ne: null }, codeRegion }),
            avis.countDocuments({ 'reported': true, codeRegion }),
        ]);

        return {
            region: regionName,
            nbOrganismesContactes: nbOrganimesContactes,
            mailsEnvoyes: relances + nbOrganimesContactes,
            tauxOuvertureMails: calculateRate(ouvertureMails, nbOrganimesContactes),
            tauxClicDansLien: calculateRate(nbClicDansLien, ouvertureMails),
            tauxOrganismesActifs: calculateRate(organismesActifs, nbOrganimesContactes),
            tauxAvisNonLus: calculateRate(avisNonLus, avisModeresNonRejetes),
            tauxCommentairesAvecReponses: calculateRate(nbCommentairesAvecOrganismesReponses, avisModeresNonRejetes),
            tauxAvisAvecReponses: calculateRate(nbAvisAvecOrganismesReponses, avisModeresNonRejetes),
            tauxAvisSignales: calculateRate(avisSignales, avisModeresNonRejetes),
        };
    };

    const getAvisStats = async (regionName, codeRegion) => {

        let trainee = db.collection('trainee');
        let avis = db.collection('comment');
        let filter = { codeRegion };
        let [
                nbStagiairesContactes, 
                relances,
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
                trainee.countDocuments({ 'tracking.firstRead': { $ne: null }, ...filter }),
                trainee.countDocuments({ 'tracking.click': { $ne: null }, ...filter }),
                trainee.countDocuments({ 'avisCreated': true, ...filter }),
                avis.countDocuments({ 'comment': { $ne: null }, ...filter }),
                avis.countDocuments({ 'comment': { $ne: null }, 'moderated': { $ne: true }, ...filter }),
                avis.countDocuments({ 'comment': { $ne: null }, 'qualification': 'positif', ...filter }),
                avis.countDocuments({ 'comment': { $ne: null }, 'qualification': 'négatif', ...filter }),
                avis.countDocuments({ 'rejected': true, ...filter })
        ]);
        let nbMailEnvoyes = relances.length > 0 ? (relances[0].totalAmount + nbStagiairesContactes) : 0;

        return {
            region: regionName,
            nbStagiairesContactes: nbStagiairesContactes,
            nbMailEnvoyes: nbMailEnvoyes,
            tauxOuvertureMail: calculateRate(nbMailsOuverts, nbMailEnvoyes),
            tauxLiensCliques: calculateRate(nbLiensCliques, nbMailsOuverts),
            tauxQuestionnairesValidees: calculateRate(nbQuestionnairesValidees, nbLiensCliques),
            tauxAvisDeposes: calculateRate(nbQuestionnairesValidees, nbStagiairesContactes),
            tauxAvisAvecCommentaire: calculateRate(nbAvisAvecCommentaire, nbQuestionnairesValidees),
            nbCommentairesAModerer: nbCommentairesAModerer,
            tauxAvisPositifs: calculateRate(nbCommentairesPositifs, nbAvisAvecCommentaire),
            tauxAvisNegatifs: calculateRate(nbCommentairesNegatifs, nbAvisAvecCommentaire),
            tauxAvisRejetes: calculateRate(nbCommentairesRejetes , nbAvisAvecCommentaire),
        };
    };

    router.get('/public-stats/organismes.json', tryAndCatch(async (req, res) => {

        let organismes = await Promise.all(findActiveRegions().map(async region => {
            return getOrganismesStats(region.nom, region.codeRegion);
        }));

        let nbOrganismesContactesNational = organismes.reduce(
            ((accumulator, currentValue) => accumulator + currentValue.nbOrganismesContactes)
            , 0);

        let nbMailsEnvoyesNational = organismes.reduce(
            ((accumulator, currentValue) => accumulator + currentValue.mailsEnvoyes)
            , 0);

        organismes.push(
            {'mailsEnvoyesNational': nbOrganismesContactesNational}, 
            {'nbMailsEnvoyesNational': nbMailsEnvoyesNational}
        );

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
