const fs = require('fs');
const { ignoreFirstLine } = require('../../../../common/utils/stream-utils');
const parse = require('csv-parse');

let loadCertifinfos = file => {
    let mapping = {};
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
        .on('error', err => reject(err))
        .pipe(parse({
            delimiter: ';',
            quote: '',
            relax_column_count: true,
            columns: [
                'cer3_code',
                'cer3_libelle',
                'cer3_etat',
                'cer3_codenew',
                'cer3_libelle',
                'cer3_etat',
            ],
        }))
        .pipe(ignoreFirstLine())
        .on('data', data => {
            mapping[data.cer3_code] = data.cer3_codenew;
        })
        .on('error', err => reject(err))
        .on('end', async () => resolve(mapping));
    });
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
                                'training.certifInfo.id': newCertifinfos,
                            },
                            $push: {
                                'meta.history': {
                                    $each: [{
                                        date: new Date(),
                                        training: {
                                            certifInfo: {
                                                id: doc.training.certifInfo.id
                                            },
                                        },
                                    }],
                                    $slice: 10,
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

