const { transformObject } = require('../../../../common/utils/stream-utils');
const reconcileFormation = require('./utils/reconcileFormation');
const reconcileActions = require('./utils/reconcileActions');
const reconcileSessions = require('./utils/reconcileSessions');
const findAvisReconciliables = require('./utils/findAvisReconciliables');

module.exports = (db, logger, options = { formations: true, actions: true, sessions: true }) => {

    return new Promise((resolve, reject) => {

        let stats = {
            imported: { formations: 0, actions: 0, sessions: 0 },
            error: 0,
        };

        let replaceOne = (type, doc) => {
            return db.collection(`${type}Reconciliees`).replaceOne({ _id: doc._id }, doc, { upsert: true })
            .then(results => {
                stats.imported[type]++;
                return results;
            })
            .catch(e => {
                logger.error(`Unable to reconcile ${type} with id ${doc._id} `, e);
                return stats.error++;
            });
        };

        db.collection('intercarif').find()
        .project({
            '_attributes': 1,
            '_meta': 1,
            'intitule_formation': 1,
            'organisme_formation_responsable': 1,
            'actions._attributes': 1,
            'actions.organisme_formateur': 1,
            'actions.organisme_financeurs': 1,
            'actions.lieu_de_formation': 1,
            'actions.sessions._attributes': 1,
        })
        .pipe(transformObject(async rawFormation => {

            try {
                let avis = await findAvisReconciliables(db, rawFormation);

                let formation = reconcileFormation(rawFormation, avis);
                let actions = reconcileActions(rawFormation, avis);
                let sessions = reconcileSessions(rawFormation, avis);

                await Promise.all([
                    ...(options.formations ? [replaceOne('formations', formation)] : []),
                    ...(options.actions ? [Promise.all(actions.map(action => replaceOne('actions', action)))] : []),
                    ...(options.sessions ? [Promise.all(sessions.map(session => replaceOne('sessions', session)))] : []),
                ]);

                return { formation: rawFormation };
            } catch (e) {
                stats.error++;
                return { error: e, formation: rawFormation };
            }
        }))
        .on('data', ({ error, formation }) => {
            if (error) {
                return logger.error(`Formation ${formation._attributes.numero} can not be reconciliated`, error);
            }
            logger.debug(`Formation ${formation._attributes.numero} from intercarif has been reconciliated`);
        })
        .on('error', e => reject(e))
        .on('finish', () => stats.error ? reject(stats) : resolve(stats));
    });
};

