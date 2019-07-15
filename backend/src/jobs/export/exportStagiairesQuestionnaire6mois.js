const cli = require('commander');
const path = require('path');
const fs = require('fs');
const Readable = require('stream').Readable;
const { promisifyStream, toCsvStream, execute, batchCursor } = require('../job-utils');

cli
.option('--output [output]')
.parse(process.argv);

const createReadableStream = () => new Readable({
    objectMode: true,
    read() {
    }
});

execute(async ({ logger, db }) => {

    logger.info(`Generating CSV file...`);
    let fileName = `questionnaire-6mois.csv`;
    let csvFile = cli.output ? path.join(cli.output, fileName) : path.join(__dirname, '../../../../.data', fileName);

    let input = createReadableStream();
    let output = toCsvStream(input, {
        'Identifiant Anotea': data => data.token,
        'Email': data => data.email,
        'Numero de session': data => `="${data.session}"`,
    })
    .pipe(fs.createWriteStream(csvFile));

    let cursor = db.collection('trainee').aggregate([
        {
            $match: {
                'campaign': 'STAGIAIRES_AES_TT_REGIONS_DELTA_2019-02-01',
                '$or': [
                    { 'training.certifInfo.id': { $ne: 'NULL' } },
                    { 'training.certifInfo.id': { $ne: '' } }
                ],
            }
        },
        {
            $group: {
                _id: '$trainee.email',
                token: { $first: '$token' },
                email: { $first: '$trainee.email' },
                session: { $first: '$training.idSession' },
            }
        }
    ])
    .limit(500);

    await batchCursor(cursor, async next => {
        let trainee = await next();
        await db.collection('trainee').updateOne({ token: trainee.token }, { $set: { 'meta.questionnaire6mois': true } });
        input.push(trainee);
    });
    input.push(null);

    return promisifyStream(output);
});
