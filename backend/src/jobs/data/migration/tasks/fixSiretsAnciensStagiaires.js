const { getNbModifiedDocuments, batchCursor } = require('../../../job-utils');

module.exports = async (db) => {

    let updated = 0;
    let cursor = db.collection('stagiaires').find({
        "formation.action.organisme_responsable": {$exists: 1},
        "formation.numero": {$exists: 1},
        "formation.action.numero": {$exists: 1},
    });
    await batchCursor(cursor, async next => {
        const stagiaire = await next();
        if (!stagiaire.formation.numero || !stagiaire.formation.action.numero) return;
        let res = await db.collection('stagiaires').updateMany({
            "formation.action.organisme_responsable": {$exists: 0},
            "formation.numero": stagiaire.formation.numero,
            "formation.action.numero": stagiaire.formation.action.numero,
        }, {
            $set: {
                'formation.action.organisme_formateur': stagiaire.formation.action.organisme_formateur,
                'formation.action.organisme_responsable': stagiaire.formation.action.organisme_responsable,
            },
        });
        updated += getNbModifiedDocuments(res);
    });
    return updated;

};
