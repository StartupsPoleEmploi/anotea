const cli = require('commander');
const fs = require('fs');
const path = require('path');
const getOrganismeEmail = require('../../common/utils/getOrganismeEmail');
const { streamToCSV } = require('../../common/utils/stream-utils');
const { execute } = require('../job-utils');

cli.description('Export organismes per active region')
.parse(process.argv);

execute(async ({ db, logger, regions }) => {

    logger.info('Building email statistics displayed on financer dashboard');

    const generateCSV = ({ nom, codeRegion }) => {

        let csvFile = path.join(__dirname, `../../../../.data/organismes-${nom}-${codeRegion}.csv`);
        let output = fs.createWriteStream(csvFile);

        logger.info(`Generating CSV file ${csvFile}...`);

        let stream = db.collection('accounts').find({ profile: 'organisme', codeRegion });

        return streamToCSV(stream, output, {
            'Siret': organisme => `="${organisme.meta.siretAsString}"`,
            'Raison sociale': organisme => organisme.raisonSociale,
            'Email': organisme => getOrganismeEmail(organisme),
            'Nombre Avis': organisme => organisme.score.nb_avis,
            'Kairos': organisme => !!organisme.sources.find(s => s === 'kairos'),
        });
    };

    await Promise.all(regions.findActiveRegions().map(region => generateCSV(region)));
});
