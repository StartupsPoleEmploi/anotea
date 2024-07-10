module.exports = async (db, stagiaire) => {
    let nbStagiaires = await db.collection('stagiaires').countDocuments({
        refreshKey: stagiaire.refreshKey,
        individu: { $exists: false }
    });
    return nbStagiaires === 1;
};
