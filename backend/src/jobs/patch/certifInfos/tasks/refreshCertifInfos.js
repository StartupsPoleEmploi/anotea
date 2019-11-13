const fs = require('fs');
const _ = require('lodash');
const { ignoreFirstLine, pipeline, writeObject } = require('../../../../common/utils/stream-utils');
const parse = require('csv-parse');

let loadCertifinfos = async file => {
    let handleCodeChaining = mapping => {
        let chainDetected = false;

        let acc = Object.keys(mapping).reduce((acc, code) => {
            let newCode = mapping[code];
            let hasMapping = !!mapping[newCode];
            if (hasMapping) {
                chainDetected = true;
            }

            return {
                ...acc,
                [code]: hasMapping ? mapping[newCode] : mapping[code],
            };
        }, {});

        return chainDetected ? handleCodeChaining(acc) : acc;
    };

    let mapping = {};
    await pipeline([
        fs.createReadStream(file),
        parse({
            delimiter: ';',
            quote: '',
            relax_column_count: true,
            columns: [
                'cer3_code',
                'cer3_libelle',
                'cer3_etat',
                'cer3_codenew',
                'cer3_libellenew',
                'cer3_etat',
            ],
        }),
        ignoreFirstLine(),
        writeObject(data => {
            mapping[data.cer3_code] = data.cer3_codenew;
        }),
    ]);

    return handleCodeChaining(mapping);
};

module.exports = async (db, logger, file) => {

    const patch = async (collectionName, certifications) => {

        let stats = {
            updated: 0,
            invalid: 0,
            total: 0,
        };

        let getNewCertifInfos = doc => {
            return doc.training.certifInfos.map(code => {
                return certifications[code] ? certifications[code] : code;
            });
        };

        let getNewMeta = doc => {
            let meta = _.cloneDeep(doc.meta) || {};
            meta.history = meta.history || [];
            meta.history.unshift({
                date: new Date(),
                training: {
                    certifInfos: doc.training.certifInfos,
                },
            });

            return meta;
        };

        let cursor = db.collection(collectionName).find({});
        while (await cursor.hasNext()) {
            stats.total++;
            const doc = await cursor.next();
            try {
                if (doc.training.certifInfos.find(code => certifications[code])) {

                    let results = await db.collection(collectionName).replaceOne(
                        { _id: doc._id },
                        Object.assign({}, doc, {
                            training: {
                                certifInfos: getNewCertifInfos(doc),
                            },
                            meta: getNewMeta(doc),
                        }),
                        { upsert: false });

                    if (results.result.nModified === 1) {
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

    let certifInfos = await loadCertifinfos(file);
    let [trainee, comment] = await Promise.all([
        patch('trainee', certifInfos),
        patch('comment', certifInfos),
    ]);

    return { trainee, comment };
};

