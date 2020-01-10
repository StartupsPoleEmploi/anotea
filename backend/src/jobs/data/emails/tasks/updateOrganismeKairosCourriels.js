const { writeObject, ignoreFirstLine, pipeline, parseCSV } = require('../../../../core/utils/stream-utils');
const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async (db, logger, stream) => {

    let stats = {
        total: 0,
        updated: 0,
        unknown: 0,
        invalid: 0,
    };

    await pipeline([
        stream,
        parseCSV({
            delimiter: '|',
            quote: '',
            columns: [
                'Siret',
                'Nom',
                'Email Anotea',
                'Nombre Avis',
                'Email Kairos',
            ],
        }),
        ignoreFirstLine(),
        writeObject(async record => {
            try {
                stats.total++;
                let siret = record['Siret'];

                let organisme = await db.collection('accounts').findOne({ 'meta.siretAsString': siret });
                if (!organisme) {
                    stats.unknown++;
                    return;
                }

                let res = await db.collection('accounts').updateOne({ 'meta.siretAsString': siret }, {
                    $set: {
                        courriel: record['Email Kairos']
                    },
                    $addToSet: {
                        courriels: { $each: [record['Email Anotea'], record['Email Kairos']] }
                    },
                });

                if (getNbModifiedDocuments(res) > 0) {
                    stats.updated++;
                    logger.debug(`Organisme ${record.siret} updated`);
                }

            } catch (e) {
                stats.invalid++;
                logger.error(`Organisme cannot be updated`, record, e);
            }
        }, { parallel: 25 })
    ]);

    return stats;
};

