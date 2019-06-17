const _ = require('lodash');
const { execute } = require('../../../job-utils');

execute(async ({ logger, db }) => {

    let computeStats = async () => {

        let groupBy = (aggregator, avis, value) => {

            let reconciliations = _.get(avis, 'meta.reconciliations', []);
            let reconciliable = reconciliations.length > 0 ? reconciliations[0].reconciliable : false;

            if (!aggregator[value]) {
                aggregator[value] = {
                    value,
                    total: 1,
                    reconciliable: reconciliable ? 1 : 0,
                    non_reconciliable: !reconciliable ? 1 : 0,
                };
            } else {
                aggregator[value].total++;
                aggregator[value][reconciliable ? 'reconciliable' : 'non_reconciliable']++;
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
            .on('data', avis => {
                groupBy(stats.formacodes, avis, avis.training.formacode);
                groupBy(stats.certifinfos, avis, avis.training.certifInfo.id);
                groupBy(stats.sirets, avis, avis.training.organisation.siret);
                groupBy(stats.lieux, avis, avis.training.place.postalCode);
                groupBy(stats.regions, avis, avis.codeRegion);
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
