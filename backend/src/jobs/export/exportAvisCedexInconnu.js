const cli = require('commander');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { execute } = require('../job-utils');
const { ignoreEmpty, transformObject, pipeline, transformObjectIntoCSV, encodeIntoUTF8 } = require('../../common/utils/stream-utils');

cli
.option('--output [output]')
.parse(process.argv);

execute(async ({ logger, db }) => {

    logger.info(`Generating CSV file...`);
    let fileName = 'avisCedexInconnu.csv';
    let csvFile = cli.output ? path.join(cli.output, fileName) : path.join(__dirname, '../../../../.data', fileName);

    logger.info(`Generating CSV file ${csvFile}...`);

    return pipeline([
        db.collection('comment').find(),
        transformObject(async avis => {
            let trainee = await db.collection('trainee').findOne({ token: avis.token });
            const place = trainee.training.place;
            const inseeCity = await db.collection('inseeCode').findOne({
                $or: [
                    { cedex: { $elemMatch: { $eq: place._id } } },
                    { postalCode: { $elemMatch: { $eq: place._id } } },
                    { insee: place._id },
                    { commune: place._id }
                ]
            });
            if (inseeCity === null) {
                return trainee;
            } else {
                return '';
            }
        }),
        ignoreEmpty(),
        transformObjectIntoCSV({
            'Prénom': data => data.trainee.firstName,
            'Nom': data => data.trainee.name,
            'Identifiant PE national': data => data.trainee.dnIndividuNational,
            'Identifiant PE local': data => data.trainee.idLocal,
            'Titre formation': data => data.training.title,
            'Siret organisme': data => `="${data.training.organisation.siret}"`,
            'Code postal': data => data.training.place.postalCode,
            'Ville': data => data.training.place.city,
            'Région': data => data.codeRegion,
            'Date import': data => moment(data.importDate).format('DD/MM/YYYY'),
        }),
        encodeIntoUTF8(),
        fs.createWriteStream(csvFile)
    ]);
});
