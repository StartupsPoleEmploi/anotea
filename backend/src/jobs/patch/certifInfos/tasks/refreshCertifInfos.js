const fs = require('fs');
const { ignoreFirstLine, pipeline, writeObject } = require('../../../../common/utils/stream-utils');
const parse = require('csv-parse');

let loadCertifinfos = async file => {
    let handleCodeChaining = mapping => {
        let chainDetected = false;

        let acc = Object.keys(mapping).reduce((acc, code) => {
            let newValue = mapping[code];
            let hasMapping = !!mapping[newValue.code];
            if (hasMapping) {
                chainDetected = true;
            }

            return {
                ...acc,
                [code]: hasMapping ? mapping[newValue.code] : mapping[code],
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
            mapping[data.cer3_code] = { code: data.cer3_codenew, label: data.cer3_libellenew };
        }),
    ]);

    return handleCodeChaining(mapping);
};

module.exports = async (db, logger, file) => {

    const patch = async (collectionName, certifinfos) => {

        let stats = {
            updated: 0,
            invalid: 0,
            total: 0,
        };

        let cursor = db.collection(collectionName).find({});
        while (await cursor.hasNext()) {
            stats.total++;
            const doc = await cursor.next();
            try {
                let newCertifinfos = certifinfos[doc.training.certifInfo.id];
                if (newCertifinfos) {
                    let results = await db.collection(collectionName).updateOne(
                        { _id: doc._id },
                        {
                            $set: {
                                'training.certifInfo.id': newCertifinfos.code,
                                'training.certifInfo.label': newCertifinfos.label,
                            },
                            $push: {
                                'meta.history': {
                                    $each: [{
                                        date: new Date(),
                                        training: {
                                            certifInfo: {
                                                id: doc.training.certifInfo.id,
                                                label: doc.training.certifInfo.label,
                                            },
                                        },
                                    }],
                                    $position: 0,
                                },
                            }
                        },
                        { upsert: false }
                    );

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

    let certifinfos = await loadCertifinfos(file);
    let [trainee, comment] = await Promise.all([
        patch('trainee', certifinfos),
        patch('comment', certifinfos),
    ]);

    return { trainee, comment };
};

