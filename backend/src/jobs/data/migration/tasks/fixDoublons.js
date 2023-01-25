const md5 = require('md5');
const { getNbModifiedDocuments, batchCursor } = require('../../../job-utils');

module.exports = async (db) => {

    let updated = 0;
    let cursor = db.collection('stagiaires').find({
        "individu.email": {$exists: 1},
        "individu.identifiant_pe": {$exists: 1},
        "formation.action.organisme_responsable": {$exists: 1},
        "formation.action.session.id": {$exists: 1},
    });
    await batchCursor(cursor, async next => {
        const stagiaire = await next();
        let res = await db.collection('stagiaires').updateMany({
            refreshKey: { $ne: stagiaire.refreshKey },
            "individu.identifiant_pe": stagiaire.individu.identifiant_pe,
            "formation.action.session.id": stagiaire.formation.action.session.id,
        }, {
            $set: {
                refreshKey: md5(`${stagiaire.email};${stagiaire.idSession}`),
                'individu.email': stagiaire.individu.email,
                'formation.action.organisme_formateur': stagiaire.formation.action.organisme_formateur,
                'formation.action.organisme_responsable': stagiaire.formation.action.organisme_responsable,
            },
        });
        const docModif = getNbModifiedDocuments(res);
        updated += docModif;
        if (docModif > 0) {
            await db.collection('stagiaires').updateOne({ _id: stagiaire._id }, {
                $set: {
                    doublon: 1,
                },
            });
        }
    });
    return updated;

};
