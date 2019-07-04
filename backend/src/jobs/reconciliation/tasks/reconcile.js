const _ = require('lodash');
const buildFormation = require('./reconcile/buildFormation');
const buildAction = require('./reconcile/buildAction');
const buildSession = require('./reconcile/buildSession');
const findAvisReconciliables = require('./reconcile/findAvisReconciliables');

module.exports = async (db, logger, options = {}) => {

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

    let cursor = db.collection('intercarif')
    .find()
    .batchSize(25)
    .project({
        '_attributes': 1,
        '_meta': 1,
        'intitule_formation': 1,
        'objectif_formation': 1,
        'organisme_formation_responsable': 1,
        'actions._attributes': 1,
        'actions.organisme_formateur': 1,
        'actions.organisme_financeurs': 1,
        'actions.lieu_de_formation': 1,
        'actions.sessions._attributes': 1,
        'actions.sessions.periode': 1,
    });

    let promises = [];
    while (await cursor.hasNext()) {
        let intercarif = await cursor.next();
        intercarif.actions = intercarif.actions.filter(a => a.lieu_de_formation.coordonnees.adresse);

        if (promises.length >= 25) {
            await Promise.all(promises);
            promises = [];
        }

        try {

            let reconciliations = await Promise.all(intercarif.actions.map(action => {
                return findAvisReconciliables(db, intercarif, action, options);
            }));

            let actions = reconciliations.reduce((acc, { action, comments }) => {
                return [
                    ...acc,
                    buildAction(intercarif, action, comments),
                ];
            }, []);

            let sessions = reconciliations.reduce((acc, { action, comments }) => {
                let sessions = action.sessions;
                return [
                    ...acc,
                    ...sessions.map(session => buildSession(intercarif, action, session, comments)),
                ];
            }, []);

            let formation = buildFormation(intercarif,
                _.chain(reconciliations).flatMap(r => r.comments).uniqBy(['token']).value()
            );

            promises.push(
                Promise.all([
                    replaceOne('formations', formation),
                    Promise.all(actions.map(action => replaceOne('actions', action))),
                    Promise.all(sessions.map(session => replaceOne('sessions', session))),
                ])
            );

            logger.debug(`Formation ${intercarif._attributes.numero} from intercarif has been reconciliated`);

        } catch (e) {
            stats.error++;
            logger.error(`Formation ${intercarif._attributes.numero} can not be reconciliated`, e);
        }
    }

    await Promise.all(promises);

    return stats.error ? Promise.reject(stats) : stats;
};

