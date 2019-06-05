module.exports = async db => {

    let updated = 0;

    let cursor = db.collection('comment').find().batchSize(10);

    while (await cursor.hasNext()) {
        let avis = await cursor.next();

        let [nbSessions, nbActions, nbFormations] = await Promise.all([
            db.collection('sessionsReconciliees').countDocuments({ 'avis.id': avis._id }),
            db.collection('actionsReconciliees').countDocuments({ 'avis.id': avis._id }),
            db.collection('formationsReconciliees').countDocuments({ 'avis.id': avis._id }),
        ]);

        let reconciliation = {
            date: new Date(),
            reconciliable: nbFormations + nbActions + nbSessions > 0,
            formation: nbFormations > 0,
            action: nbActions > 0,
            session: nbSessions > 0,
        };

        await db.collection('comment').updateOne({ _id: avis._id }, {
            $set: {
                'meta.reconciliation': reconciliation,
            },
            $push: {
                'meta.reconciliations': {
                    $each: [reconciliation],
                    $slice: 30,
                },
            }
        });
        updated++;
    }

    return updated;
};
