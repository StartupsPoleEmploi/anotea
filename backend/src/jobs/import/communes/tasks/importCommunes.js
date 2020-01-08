const fs = require('fs');
const parse = require('csv-parse');
const { writeObject, pipeline, ignoreFirstLine } = require('../../../../core/utils/stream-utils');

let getCedexMapping = async file => {
    let accumulator = {};
    await pipeline([
        fs.createReadStream(file),
        parse({ delimiter: ',' }),
        ignoreFirstLine(),
        writeObject(async record => {
            let libelle = record[17];
            let inseeCode = record[20];
            let cedex = record[21];
            let libelleCedex = record[22];

            if (inseeCode && cedex && libelleCedex.indexOf(libelle) !== -1) {
                if (!accumulator[inseeCode]) {
                    accumulator[inseeCode] = [];
                }

                if (accumulator[inseeCode].indexOf(cedex) === -1) {
                    accumulator[inseeCode].push(cedex);
                }
            }
        }),
    ]);

    return accumulator;
};

module.exports = async (db, logger, communesCsvFile, cedexCsvFile) => {

    let stats = { total: 0, created: 0, updated: 0, invalid: 0 };

    await db.collection('communes').removeMany({});

    let cedexMapping = await getCedexMapping(cedexCsvFile);
    await pipeline([
        fs.createReadStream(communesCsvFile),
        parse({ delimiter: ';' }),
        ignoreFirstLine(),
        writeObject(async record => {
            stats.total++;
            let inseeCode = record[0];
            try {
                let results = await db.collection('communes').updateOne(
                    { inseeCode },
                    {
                        $set: {
                            inseeCode,
                            nom: record[1],
                        },
                        $addToSet: {
                            cedex: { $each: cedexMapping[inseeCode] || [] },
                            postalCodes: record[2],
                        }
                    },
                    { upsert: true }
                );

                if (results.result.nModified === 1) {
                    stats.updated += results.result.nModified;
                } else {
                    stats.created += results.result.n;
                }
            } catch (e) {
                stats.invalid++;
                logger.error(`Unable to create commune for line ${record}`, e);
            }

        }, { parallel: 100 }),
    ]);

    await db.collection('communes').insertOne({
        insee: '75100',
        commune: 'Paris',
        postalCodes: ['75000'],
        cedex: []
    });

    return stats;
};
