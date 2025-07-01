const md5 = require('md5');
const { getNbModifiedDocuments, batchCursor } = require('../../../job-utils');

module.exports = async (db) => {

    let updated = 0;
    let cursor = db.collection('stagiaires').find(
        {
            dispositifFinancement: { $in: ["FOAD", "Autres_AFC"] }
        },
        {
            token: 1,
            dispositifFinancement: 1,
        }
    );
    await batchCursor(cursor, async next => {
        const stagiaire = await next();
        let res = await db.collection('avis').updateMany({
            token: stagiaire.token
        }, {
            $set: {
                dispositifFinancement: stagiaire.dispositifFinancement
            },
        });
        const docModif = getNbModifiedDocuments(res);
        updated += docModif;
    });
    return updated;

};
