const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async (db, logger) => {
    let stats = {
        updated: 0,
        invalid: 0,
        total: 0,
    };
    
    let cursor = db.collection('stagiaires').find({
        "formation.action.organisme_responsable": { $exists: true }
    });
    while (await cursor.hasNext()) {
        try {
            stats.total++;
            const stagiaire = await cursor.next();

            if (stagiaire 
                && stagiaire.refreshKey 
                && stagiaire.formation 
                && stagiaire.formation.action
                && stagiaire.formation.action.organisme_responsable) {
                let results = await db.collection('avis').updateMany({ refreshKey: stagiaire.refreshKey }, {
                    $set: {
                        'formation.action.organisme_responsable': stagiaire.formation.action.organisme_responsable,
                    }
                });

                if (getNbModifiedDocuments(results) > 0) {
                    stats.updated++;
                }
            }
        } catch (e) {
            stats.invalid++;
            logger.error(`Stagiaire cannot be patched`, e);
        }
    }

    return stats;
};

