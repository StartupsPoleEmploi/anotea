const path = require('path');
const fs = require('fs');
const { execute } = require('../job-utils');
const { ignoreEmpty, pipeline, transformObjectIntoCSV, encodeIntoUTF8 } = require('../../common/utils/stream-utils');

execute(async ({ logger, db }) => {

    logger.info(`Generating CSV file...`);
    let csvFile = path.join(__dirname, '../../../../.data', `certifInfos-updated.csv`);

    logger.info(`Generating CSV file ${csvFile}...`);
    return pipeline([
        db.collection('comment').find({ 'meta.history.training.certifInfos.0': { $exists: true } }),
        transformObjectIntoCSV({
            'id': comment => comment._id.toString(),
            'Anciens CertifInfos': comment => {
                let history = comment.meta.history;
                let matching = history.find(h => h.training && h.training.certifInfos);
                return matching.training.certifInfos.join(',');
            },
            'Nouveaux CertifInfos': comment => comment.training.certifInfos.join(','),
        }),
        encodeIntoUTF8(),
        fs.createWriteStream(csvFile)
    ]);
});
