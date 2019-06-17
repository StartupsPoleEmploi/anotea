const _ = require('lodash');

const hasChanged = (r1, r2) => JSON.stringify(_.omit(r1, ['date'])) !== JSON.stringify(_.omit(r2, ['date']));

module.exports = async db => {

    let updated = 0;

    let cursor = db.collection('comment').find().batchSize(10);

    while (await cursor.hasNext()) {
        let comment = await cursor.next();

        let [nbSessions, nbActions, nbFormations] = await Promise.all([
            db.collection('sessionsReconciliees').countDocuments({ 'avis.id': comment._id }),
            db.collection('actionsReconciliees').countDocuments({ 'avis.id': comment._id }),
            db.collection('formationsReconciliees').countDocuments({ 'avis.id': comment._id }),
        ]);

        let reconciliation = {
            date: new Date(),
            reconciliable: nbFormations + nbActions + nbSessions > 0,
            formation: nbFormations > 0,
            action: nbActions > 0,
            session: nbSessions > 0,
        };

        if (!_.get(comment, 'meta.reconciliations') || hasChanged(comment.meta.reconciliations[0], reconciliation)) {
            await db.collection('comment').updateOne({ _id: comment._id }, {
                $push: {
                    'meta.reconciliations': {
                        $each: [reconciliation],
                        $slice: 10,
                        $position: 0,
                    },
                }
            });
            updated++;
        }
    }

    return updated;
};
