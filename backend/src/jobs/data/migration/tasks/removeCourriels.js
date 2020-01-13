const _ = require('lodash');
const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let cursor = db.collection('accounts').find({
        profile: 'organisme',
    });
    let updated = 0;

    await batchCursor(cursor, async next => {
        let organisme = await next();
        let { courriel, editedCourriel, kairosCourriel } = organisme;

        let courriels = (organisme.courriels || [])
        .filter(c => c && ![courriel, editedCourriel, kairosCourriel].includes(c))
        .map(c => ({ courriel: c, source: 'intercarif' }));
        courriels.push({ courriel: courriel, source: 'intercarif' });
        courriels.push({ courriel: editedCourriel, source: 'anotea' });
        courriels.push({ courriel: kairosCourriel, source: 'kairos' });

        let results = await db.collection('accounts').updateOne({ _id: organisme._id }, {
            $set: {
                courriel: editedCourriel || kairosCourriel || courriel,
                courriels: _.uniqWith(courriels.filter(c => c.courriel), (v1, v2) => v1.courriel === v2.courriel),
            },
            $unset: {
                editedCourriel: 1,
                kairosCourriel: 1
            }
        });

        if (results.result.nModified === 1) {
            updated++;
        }
    });

    return { updated };
};
