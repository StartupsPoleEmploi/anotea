module.exports = async (db, stagiaire) => {
    let nbStagiaires = await db.collection('stagiaires').countDocuments({ refreshKey: stagiaire.refreshKey });
    return nbStagiaires === 0;
};
