const _ = require('lodash');
const areEquals = (r1, r2) => JSON.stringify(_.omit(r1, ['date'])) === JSON.stringify(_.omit(r2, ['date']));

module.exports = async db => {

    let cursor = await db.collection('comment').find();
    let stats = {
        updated: 0,
        total: await cursor.count(),
    };

    while (await cursor.hasNext()) {
        let comment = await cursor.next();

        let reconciliations = _.get(comment, 'meta.reconciliations');
        if (reconciliations) {

            await db.collection('comment').updateOne({ _id: comment._id }, {
                $set: {
                    'meta.reconciliations': reconciliations.reduce((acc, current) => {
                        let previous = acc[acc.length - 1];
                        if (acc.length === 0 || (previous && !areEquals(previous, current))) {
                            acc.push(current);
                        }
                        return acc;
                    }, []).reverse(),
                }
            });
            stats.updated++;
        }
    }

    await db.collection('comment').updateMany({}, {
        $unset: {
            'meta.reconciliation': 1,
        }
    });


    return stats;
};
