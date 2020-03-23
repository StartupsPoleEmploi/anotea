const { batchCursor } = require('../../../job-utils');
const md5 = require('md5');
const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {

    let stats = {
        stagiaires: 0,
        avis: 0,
    };

    let cursor = db.collection('stagiaires').find({});
    await batchCursor(cursor, async next => {
        let stagiaire = await next();
        let refreshKey = stagiaire.sourceIDF ?
            md5(`${stagiaire.individu.email};${stagiaire.formation.action.numero}`) :
            md5(`${stagiaire.individu.identifiant_local};${stagiaire.formation.action.session.id}`);

        let results = await Promise.all([
            db.collection('stagiaires').updateOne({ token: stagiaire.token }, {
                $set: {
                    refreshKey,
                },
            }, { upsert: false }),
            db.collection('avis').updateOne({ token: stagiaire.token }, {
                $set: {
                    refreshKey,
                },
            }, { upsert: false }),
        ]);

        stats.stagiaires += getNbModifiedDocuments(results[0]);
        stats.avis += getNbModifiedDocuments(results[1]);
    }, { batchSize: 100 });

    return stats;
};
