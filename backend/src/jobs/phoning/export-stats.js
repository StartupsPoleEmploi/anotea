const fs = require('fs');
const parse = require('csv-parse');

module.exports = (logger, db, configuration, file) => {

    const csvOptions = {
        delimiter: ',',
        bom: true,
        columns: [
            'nom',
            'prenom',
            'telephone',
            'formation',
            'date',
            'lien'
        ]
    };

    const TOKEN_LENGTH = 64;

    const ROOT_URI_LENGTH = 48;

    return new Promise(async (resolve, reject) => {
        logger.info('Exporting stats for SMS campaign...');

        let stats = {
            total: 0,
            liensOuverts: 0,
            avis: 0,
            commentaires: 0
        };

        fs.createReadStream(file)
        .pipe(parse(csvOptions))
        .on('data', async line => {
            stats.total++;
            const token = line.lien.substring(ROOT_URI_LENGTH, ROOT_URI_LENGTH + TOKEN_LENGTH);
            const avis = await db.collection('comment').findOne({ token: token });
            if (avis !== null) {
                stats.avis++;
                if (avis.comment.title !== '' || avis.comment.text !== '') {
                    stats.commentaires++;
                }
            }
        })
        .on('finish', async () => {
            console.log(stats);
            resolve();
        });
    });
};
