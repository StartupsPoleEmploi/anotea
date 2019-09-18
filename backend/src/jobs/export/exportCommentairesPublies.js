const cli = require('commander');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const { execute } = require('../job-utils');
const { ignoreEmpty, pipeline, transformObjectIntoCSV, encodeIntoUTF8 } = require('../../common/utils/stream-utils');

cli
.option('--output [output]')
.parse(process.argv);

execute(async ({ logger, db }) => {

    logger.info(`Generating CSV file...`);
    let fileName = `commentaires-publies.csv`;
    let csvFile = cli.output ? path.join(cli.output, fileName) : path.join(__dirname, '../../../../.data', fileName);
    let sanitizeString = note => `${note}`.replace(/;/g, '').replace(/"/g, '').replace(/\r/g, ' ').replace(/\n/g, ' ').trim();

    logger.info(`Generating CSV file ${csvFile}...`);


    return pipeline([
        db.collection('comment').find({
            comment: { $exists: true },
            $or: [
                { published: true },
                { rejected: true },
            ]
        }),
        ignoreEmpty(),
        transformObjectIntoCSV({
            'pseudo': data => sanitizeString(data.comment.pseudo || ''),
            'titre': data => sanitizeString(data.comment.title || ''),
            'commentaire': data => sanitizeString(data.comment.text || ''),
            'statut': data => data.published ? `publié (${data.qualification})` : 'rejeté',
            'reponse': data => _.get(data, 'reponse.status') === 'published' ? sanitizeString(data.reponse.text) : '',
        }),
        encodeIntoUTF8(),
        fs.createWriteStream(csvFile)
    ]);
});
