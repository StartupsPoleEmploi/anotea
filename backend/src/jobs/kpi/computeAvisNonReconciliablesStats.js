const cli = require('commander');
const { execute } = require('../job-utils');
const { transformObject } = require('../../common/utils/stream-utils');

cli.description('Export organismes per active region')
.parse(process.argv);

execute(async ({ logger, db }) => {

    let computeStats = async () => {

        //Building indexes only for this script
        await Promise.all([
            db.collection('sessionsReconciliees').createIndex({ 'avis._id': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'avis._id': 1 }),
            db.collection('formationsReconciliees').createIndex({ 'avis._id': 1 }),
        ]);

        let aggregate = (aggregator, avis, value) => {

            if (!aggregator[value]) {
                aggregator[value] = {
                    value,
                    total: 1,
                    reconciliable: avis.reconciliable ? 1 : 0,
                    non_reconciliable: !avis.reconciliable ? 1 : 0,
                };
            } else {
                aggregator[value].total++;
                aggregator[value][avis.reconciliable ? 'reconciliable' : 'non_reconciliable']++;
            }
        };

        return new Promise((resolve, reject) => {
            let stats = {
                formacodes: {},
                certifinfos: {},
                sirets: {},
                lieux: {},
                regions: {},
            };

            db.collection('comment').find()
            .pipe(transformObject(async avis => {
                let [sessions, actions, formations] = await Promise.all([
                    db.collection('sessionsReconciliees').countDocuments({ 'avis._id': avis._id }),
                    db.collection('actionsReconciliees').countDocuments({ 'avis._id': avis._id }),
                    db.collection('formationsReconciliees').countDocuments({ 'avis._id': avis._id }),
                ]);
                return { ...avis, reconciliable: sessions + actions + formations > 0 };
            }))
            .on('data', avis => {
                aggregate(stats.formacodes, avis, avis.training.formacode);
                aggregate(stats.certifinfos, avis, avis.training.certifInfo.id);
                aggregate(stats.sirets, avis, avis.training.organisation.siret);
                aggregate(stats.lieux, avis, avis.training.place.postalCode);
                aggregate(stats.regions, avis, avis.codeRegion);
            })
            .on('error', e => reject(e))
            .on('finish', () => resolve(stats));
        });
    };

    let findNonReconciliables = aggregator => {
        return Object.keys(aggregator).reduce((acc, key) => {
            let formacode = aggregator[key];
            if (formacode.reconciliable === 0) {
                acc.push(formacode);
            }
            return acc;
        }, []);
    };

    let stats = await computeStats();
    logger.info({
        formacodes_non_reconciliables:
            Math.round((findNonReconciliables(stats.formacodes).length / Object.keys(stats.formacodes).length) * 100),
        certifinfos_non_reconciliables:
            Math.round((findNonReconciliables(stats.certifinfos).length / Object.keys(stats.certifinfos).length) * 100),
        sirets_non_reconciliables:
            Math.round((findNonReconciliables(stats.sirets).length / Object.keys(stats.sirets).length) * 100),
        lieux_non_reconciliables:
            Math.round((findNonReconciliables(stats.lieux).length / Object.keys(stats.lieux).length) * 100),
    });

});
