module.exports = async (db, stagiaire) => {
    let nbStagiaires = await db.collection('stagiaires').countDocuments({
        refreshKey: stagiaire.refreshKey,
        "formation.action.organisme_responsable": { $exists: false }
    });
    return nbStagiaires === 1;
};
