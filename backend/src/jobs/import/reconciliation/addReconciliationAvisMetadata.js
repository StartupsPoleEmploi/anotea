const { transformObject } = require('../../../common/utils/stream-utils');

module.exports = async db => {

    let updated = 0;
    return new Promise((resolve, reject) => {
        db.collection('comment').find()
        .pipe(transformObject(async avis => {
            let [nbSessions, nbActions, nbFormations] = await Promise.all([
                db.collection('sessionsReconciliees').countDocuments({ 'avis._id': avis._id }),
                db.collection('actionsReconciliees').countDocuments({ 'avis._id': avis._id }),
                db.collection('formationsReconciliees').countDocuments({ 'avis._id': avis._id }),
            ]);

            return db.collection('comment').updateOne({ _id: avis._id }, {
                $push: {
                    'meta.reconciliations': {
                        $each: [{
                            date: new Date(),
                            reconciliable: nbFormations + nbActions + nbSessions > 0,
                            formation: nbFormations > 0,
                            action: nbActions > 0,
                            session: nbSessions > 0,
                        }],
                        $slice: 365,
                    },
                }
            });
        }))
        .on('data', () => {
            updated++;
        })
        .on('error', e => reject(e))
        .on('finish', () => resolve({ updated }));
    });
};
