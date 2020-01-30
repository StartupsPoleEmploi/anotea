module.exports = async (db, codeRegion) => {

    let organismes = db.collection('accounts');
    let filter = codeRegion ? { codeRegion } : {};

    let [
        nbOrganismesContactes,
        nbRelances,
        nbOuvertureMails,
        nbLiensCliques,
        nbOrganismesActifs,
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
    ]);

    return {
        nbOrganismesContactes,
        nbMailsEnvoyes: nbRelances + nbOrganismesContactes,
        nbOuvertureMails,
        nbLiensCliques,
        nbOrganismesActifs,
    };
};
