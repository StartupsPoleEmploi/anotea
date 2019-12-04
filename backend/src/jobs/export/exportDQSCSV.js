const cli = require('commander');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { execute } = require('../job-utils');
const { ignoreEmpty, transformObject, pipeline, transformObjectIntoCSV, encodeIntoUTF8 } = require('../../common/utils/stream-utils');

cli
.option('--output [output]')
.parse(process.argv);

execute(async ({ logger, db, regions }) => {

    logger.info(`Generating CSV file...`);
    let idf = regions.findRegionByCodeRegion('11');
    let fileName = `DQS-${idf.nom}-${idf.codeRegion}.csv`;
    let csvFile = cli.output ? path.join(cli.output, fileName) : path.join(__dirname, '../../../../.data', fileName);

    logger.info(`Generating CSV file ${csvFile}...`);

    return pipeline([
        db.collection('comment').find({
            'codeRegion': idf.codeRegion,
            'campaign': { $ne: 'STAGIAIRES_AES_TT_REGIONS_REPRISE_IDF_2019-03-15' },
            'training.scheduledEndDate': { $gte: moment('2019-01-01 00Z').toDate() },
        }),
        transformObject(async comment => {
            let trainee = await db.collection('trainee').findOne({ token: comment.token });

            return trainee ? { ...comment, trainee: trainee.trainee } : '';
        }),
        ignoreEmpty(),
        transformObjectIntoCSV({
            'Identifiant Anotea': data => data.token,
            'Identifiant PE national': data => data.trainee.dnIndividuNational,
            'Identifiant PE local': data => data.trainee.idLocal,
            'Titre formation': data => data.training.title,
            'Siret organisme': data => `="${data.training.organisation.siret}"`,
            'Lieu de formation': data => data.training.place.postalCode,
            'Certifinfos': data => `="${data.training.certifInfos.join(',')}"`,
            'Formacodes': data => data.training.formacodes.join(','),
        }),
        encodeIntoUTF8(),
        fs.createWriteStream(csvFile)
    ]);
});
