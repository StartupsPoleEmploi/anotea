const { batchCursor } = require('../../../job-utils');

module.exports = async (db, logger) => {

    let cursor = db.collection('accounts').find({ 'profile': 'organisme', 'editedCourriel': { $exists: true } });
    let updated = 0;

    await batchCursor(cursor, async next => {
        let organisme = await next();

        let courriels = new Set(organisme.courriels.filter(c => c));
        courriels.add(organisme.editedCourriel);
        courriels.add(organisme.kairosCourriel);
        courriels.add(organisme.courriel);

        let results = await db.collection('accounts').updateOne({ _id: organisme._id }, {
            $set: {
                courriel: organisme.editedCourriel || organisme.kairosCourriel || organisme.courriel,
                courriels: [...courriels]
            },
        });

        if (results.result.nModified === 1) {
            logger.info(`${organisme.SIRET} ${organisme.editedCourriel} ${organisme.courriel} ${organisme.kairosCourriel}`);
            updated++;
        }
    });

    return updated;
};
