const fs = require('fs');
const { ignoreFirstLine } = require('../../../../../common/utils/stream-utils');
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
        .on('finish', async () => resolve(mapping));
    });
};

module.exports = async (db, logger, file) => {

    let stats = {
        updated: 0,
        invalid: 0,
        total: 0,
    };

    let certifinfos = await loadCertifinfos(file);
    let cursor = db.collection('trainee').find({ 'meta.patch.certifInfo': { $exists: false } });
    while (await cursor.hasNext()) {
        stats.total++;
        const trainee = await cursor.next();
        try {
            let newCertifinfos = certifinfos[trainee.training.certifInfo.id];
            if (newCertifinfos) {
                let results = await db.collection('trainee').updateOne(
                    { _id: trainee._id },
                    {
                        $set: {
                            'training.certifInfo.id': newCertifinfos,
                            'meta.patch.certifInfo': trainee.training.certifInfo.id,
                        },
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

