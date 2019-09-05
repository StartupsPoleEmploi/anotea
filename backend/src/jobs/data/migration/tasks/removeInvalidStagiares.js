const { batchCursor } = require('../../../job-utils');
const moment = require('moment');

module.exports = async (db, regions) => {

    let stats = {
        trainee: {},
        comment: {},
    };

    let removeInvalidStagiares = async collectionName => {
        let cursor = db.collection(collectionName).find();
        await batchCursor(cursor, async next => {
            let doc = await next();

            let region = regions.findRegionByCodeRegion(doc.codeRegion);

            if (moment(doc.training.scheduledEndDate).isBefore(moment(`${region.since} -0000`, 'YYYYMMDD Z'))) {
                await db.collection(collectionName).removeOne({ token: doc.token });
                stats[collectionName][region.nom] = (stats[collectionName][region.nom] || 0) + 1;
            }
        });
    };

    await Promise.all([
        removeInvalidStagiares('trainee'),
        removeInvalidStagiares('comment'),
    ]);

    return stats;
};

