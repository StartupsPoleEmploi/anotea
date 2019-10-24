module.exports = (db, regions) => {

    let { findActiveRegions } = regions;
    let avis = db.collection('comment');
    let organismes = db.collection('accounts');

    const getOrganismesStats = async (label, codeRegions) => {

        let filter = { codeRegion: { $in: codeRegions } };
        let [
            nbOrganismesContactes,
            nbRelances,
            ouvertureMails,
            nbClicDansLien,
            organismesActifs,
            avisNonLus,
            avisModeresNonRejetes,
            nbReponses,
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
                'status': 'published',
                '$or': [{ 'read': false }, { 'read': { $ne: true } }], ...filter
            }),
            avis.countDocuments({ 'status': 'published', ...filter }),
            avis.countDocuments({ 'reponse': { $exists: true }, ...filter }),
            avis.countDocuments({ 'status': 'reported', ...filter }),
        ]);

        return {
            label,
            codeRegions,
            nbOrganismesContactes,
            mailsEnvoyes: nbRelances + nbOrganismesContactes,
            avisModeresNonRejetes,
            ouvertureMails,
            nbClicDansLien,
            organismesActifs,
            avisNonLus,
            nbReponses,
            avisSignales,
        };
    };

    let activeRegions = findActiveRegions();
    return Promise.all([
        getOrganismesStats('Toutes', activeRegions.map(region => region.codeRegion)),
        ...activeRegions.map(region => getOrganismesStats(region.nom, [region.codeRegion])),
    ]);
};
