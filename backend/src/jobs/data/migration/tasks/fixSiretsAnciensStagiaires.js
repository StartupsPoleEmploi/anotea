const { getNbModifiedDocuments, batchCursor } = require('../../../job-utils');

module.exports = async (db) => {

    let updated = 0;
    let cursor = db.collection('stagiaires').find().project({
        formation: {
            action: {
                organisme_responsable: {$exists: 1},
                session: {
                    id: {$exists: 1},
                },
            },
        },
    });
    await batchCursor(cursor, async next => {
        const stagiaire = await next();
        let res = await db.collection('stagiaires').updateMany({
            formation: {
                action: {
                    organisme_responsable: {$exists: 0},
                    session: {
                        id: stagiaire.formation.action.session.id,
                    },
                },
            },
        }, {
            $set: {
                'formation.action.organisme_formateur': stagiaire.formation.action.organisme_formateur,
                'formation.action.organisme_responsable': stagiaire.formation.action.organisme_responsable,
            },
        });
        const docModif = getNbModifiedDocuments(res);
        updated += docModif;
        if (docModif > 1) {
            await db.collection('stagiaires').updateMany({ _id: stagiaire._id }, {
                $set: {
                    doublon: 1,
                },
            });
        }
    });
    return updated;

};
