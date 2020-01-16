const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let cursor = db.collection('accounts').find({
        profile: 'organisme',
    });
    let updated = 0;

    await batchCursor(cursor, async next => {
        let organisme = await next();

        let siret = organisme.meta.siretAsString;
        if (siret.startsWith('00000')) {
            siret = siret.split('00000').join('');
        }

        let results = await db.collection('accounts').updateOne({ _id: organisme._id }, {
            $set: {
                siret,
            },
            $unset: {
                'SIRET': 1,
                'meta.siretAsString': 1,
            }
        });

        if (results.result.nModified === 1) {
            updated++;
        }
    });

    return { updated };
};
