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

    const getOrganismesStats = async filter => {

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
            organismes.countDocuments({ 'mailSentDate': { $ne: null }, 'tracking.firstRead': { $ne: null }, 'profile': 'organisme', ...filter }),
            organismes.countDocuments({ 'tracking.click': { $ne: null }, 'profile': 'organisme', ...filter }),
            organismes.countDocuments({ 'mailSentDate': { $ne: null }, 'passwordHash': { $ne: null }, 'profile': 'organisme', ...filter }),
            avis.countDocuments({ 'published': true, $or: [{ 'read': false }, { 'read': { $ne: true } }], ...filter }),
            avis.countDocuments({ 'moderated': true, 'rejected': false, ...filter }),
            avis.countDocuments({ 'answer': { $ne: null }, 'comment': { $ne: null }, ...filter }),
            avis.countDocuments({ 'answer': { $ne: null }, ...filter }),
            avis.countDocuments({ 'reported': true, ...filter }),
        ]);

        return {
            nbOrganimesContactes: nbOrganimesContactes,
            nbRelances: nbRelances,
            ouvertureMails: ouvertureMails,
            nbClicDansLien: nbClicDansLien,
            organismesActifs: organismesActifs,
            avisNonLus: avisNonLus,
            avisModeresNonRejetes: avisModeresNonRejetes,
            nbCommentairesAvecOrganismesReponses: nbCommentairesAvecOrganismesReponses,
            nbAvisAvecOrganismesReponses: nbAvisAvecOrganismesReponses,
            avisSignales: avisSignales
        };
    };

    const getRegionalOrganismesStats = async (regionName, codeRegion) => {

        let filter = { codeRegion };
        let regional = await getOrganismesStats(filter);

        return {
            region: regionName,
            nbOrganismesContactes: regional.nbOrganimesContactes,
            mailsEnvoyes: regional.nbRelances + regional.nbOrganimesContactes,
            tauxOuvertureMails: calculateRate(regional.ouvertureMails, regional.nbOrganimesContactes),
            tauxClicDansLien: calculateRate(regional.nbClicDansLien, regional.ouvertureMails),
            tauxOrganismesActifs: calculateRate(regional.organismesActifs, regional.nbOrganimesContactes),
            tauxAvisNonLus: calculateRate(regional.avisNonLus, regional.avisModeresNonRejetes),
            tauxCommentairesAvecReponses: calculateRate(regional.nbCommentairesAvecOrganismesReponses, regional.avisModeresNonRejetes),
            tauxAvisAvecReponses: calculateRate(regional.nbAvisAvecOrganismesReponses, regional.avisModeresNonRejetes),
            tauxAvisSignales: calculateRate(regional.avisSignales, regional.avisModeresNonRejetes),
        };
    };

    const getNationalOrganismesStats = async () => {

        let regions = findActiveRegions().map(region => region.codeRegion);
        let filter = { 'codeRegion': { $in: regions } };
        let national = await getOrganismesStats(filter);

        return {
            nbOrganismesContacteNational: national.nbOrganimesContactes,
            mailsEnvoyesNational: national.nbRelances + national.nbOrganimesContactes,
            tauxOuvertureMailsNational: calculateRate(national.ouvertureMails, national.nbOrganimesContactes),
            tauxClicDansLienNational: calculateRate(national.nbClicDansLien, national.ouvertureMails),
            tauxOrganismesActifsNational: calculateRate(national.organismesActifs, national.nbOrganimesContactes),
            tauxAvisNonLusNational: calculateRate(national.avisNonLus, national.avisModeresNonRejetes),
            tauxCommentairesAvecReponsesNational: calculateRate(national.nbCommentairesAvecOrganismesReponses, national.avisModeresNonRejetes),
            tauxAvisAvecReponsesNational: calculateRate(national.nbAvisAvecOrganismesReponses, national.avisModeresNonRejetes),
            tauxAvisSignalesNational: calculateRate(national.avisSignales, national.avisModeresNonRejetes),
        };
    };

    const getAvisStats = async filter => {

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
        let nbMailEnvoyes = nbRelances.length > 0 ? (nbRelances[0].totalAmount + nbStagiairesContactes) : 0;

        return {
            nbStagiairesContactes: nbStagiairesContactes,
            nbMailEnvoyes: nbMailEnvoyes,
            nbMailsOuverts: nbMailsOuverts,
            nbLiensCliques: nbLiensCliques,
            nbQuestionnairesValidees: nbQuestionnairesValidees,
            nbAvisAvecCommentaire: nbAvisAvecCommentaire,
            nbCommentairesAModerer: nbCommentairesAModerer,
            nbCommentairesPositifs: nbCommentairesPositifs,
            nbCommentairesNegatifs: nbCommentairesNegatifs,
            nbCommentairesRejetes: nbCommentairesRejetes
        };
    };

    const getRegionalAvisStats = async (regionName, codeRegion) => {
        
        let filter = { codeRegion };
        let regional = await getAvisStats(filter);

        return {
            region: regionName,
            nbStagiairesContactes: regional.nbStagiairesContactes,
            nbMailEnvoyes: regional.nbMailEnvoyes,
            tauxOuvertureMail: calculateRate(regional.nbMailsOuverts, regional.nbMailEnvoyes),
            tauxLiensCliques: calculateRate(regional.nbLiensCliques, regional.nbMailsOuverts),
            tauxQuestionnairesValides: calculateRate(regional.nbQuestionnairesValidees, regional.nbLiensCliques),
            tauxAvisDeposes: calculateRate(regional.nbQuestionnairesValidees, regional.nbStagiairesContactes),
            tauxAvisAvecCommentaire: calculateRate(regional.nbAvisAvecCommentaire, regional.nbQuestionnairesValidees),
            nbCommentairesAModerer: regional.nbCommentairesAModerer,
            tauxAvisPositifs: calculateRate(regional.nbCommentairesPositifs, regional.nbAvisAvecCommentaire),
            tauxAvisNegatifs: calculateRate(regional.nbCommentairesNegatifs, regional.nbAvisAvecCommentaire),
            tauxAvisRejetes: calculateRate(regional.nbCommentairesRejetes, regional.nbAvisAvecCommentaire),
        };
    };

    const getNationalAvisStats = async () => {

        let regions = findActiveRegions().map(region => region.codeRegion);
        let filter = { 'codeRegion': { $in: regions } };
        let national = await getAvisStats(filter);

        return {
            nbStagiairesContactesNational: national.nbStagiairesContactes,
            nbMailEnvoyesNational: national.nbMailEnvoyes,
            tauxOuvertureMailNational: calculateRate(national.nbMailsOuverts, national.nbMailEnvoyes),
            tauxLiensCliquesNational: calculateRate(national.nbLiensCliques, national.nbMailsOuverts),
            tauxQuestionnairesValidesNational: calculateRate(national.nbQuestionnairesValidees, national.nbLiensCliques),
            tauxAvisDeposesNational: calculateRate(national.nbQuestionnairesValidees, national.nbStagiairesContactes),
            tauxAvisAvecCommentaireNational: calculateRate(national.nbAvisAvecCommentaire, national.nbQuestionnairesValidees),
            nbCommentairesAModererNational: national.nbCommentairesAModerer,
            tauxAvisPositifsNational: calculateRate(national.nbCommentairesPositifs, national.nbAvisAvecCommentaire),
            tauxAvisNegatifsNational: calculateRate(national.nbCommentairesNegatifs, national.nbAvisAvecCommentaire),
            tauxAvisRejetesNational: calculateRate(national.nbCommentairesRejetes, national.nbAvisAvecCommentaire),
        };
    };

    router.get('/public-stats/organismes.json', tryAndCatch(async (req, res) => {

        let organismes = await Promise.all(findActiveRegions().map(async region => {
            return getRegionalOrganismesStats(region.nom, region.codeRegion);
        }));

        let nationalOrganismes = await getNationalOrganismesStats();

        organismes.push(nationalOrganismes);

        res.json(organismes);
    }));

    router.get('/public-stats/avis.json', tryAndCatch(async (req, res) => {

        let avis = await Promise.all(findActiveRegions().map(async region => {
            return getRegionalAvisStats(region.nom, region.codeRegion);
        }));

        let nationalAvis = await getNationalAvisStats();

        avis.push(nationalAvis);

        res.json(avis);
    }));

    return router;
};
