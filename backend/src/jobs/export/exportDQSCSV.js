const cli = require('commander');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { asPromise, csv, execute } = require('../job-utils');
const { transformObject } = require('../../common/utils/stream-utils');

cli
.option('--output [output]')
.parse(process.argv);

execute(async ({ logger, db, regions }) => {

    logger.info(`Generating CSV file...`);
    let idf = regions.findRegionByCodeRegion('11');
    let fileName = `DQS-${idf.nom}-${idf.codeRegion}.csv`;
    let csvFile = cli.output ? path.join(cli.output, fileName) : path.join(__dirname, '../../../../.data', fileName);

    logger.info(`Generating CSV file ${csvFile}...`);

    let stream = db.collection('comment').find({
        'codeRegion': idf.codeRegion,
        'campaign': { $ne: 'STAGIAIRES_AES_TT_REGIONS_REPRISE_IDF_2019-03-15' },
        'training.scheduledEndDate': { $gte: moment('2019-01-01 00Z').toDate() },
    })
    .pipe(transformObject(async comment => {
        let trainee = await db.collection('trainee').findOne({ token: comment.token });

        if (!trainee) {
            return '';
        }

        return { ...comment, trainee: trainee.trainee };
    }, { ignoreEmpty: true }));

    return asPromise(
        csv(stream, {
            'Identifiant Anotea': data => data.token,
            'Identifiant PE national': data => data.trainee.dnIndividuNational,
            'Identifiant PE local': data => data.trainee.idLocal,
            'Titre formation': data => data.training.title,
            'Siret organisme': data => `="${data.training.organisation.siret}"`,
            'Lieu de formation': data => data.training.place.postalCode,
            'Certifinfo': data => `="${data.training.certifInfo.id}"`,
            'formacode': data => data.training.formacode,
        })
        .pipe(fs.createWriteStream(csvFile))
    );
});
