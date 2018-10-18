module.exports = function(db, logger, configuration) {

    const fs = require('fs');
    const moment = require('moment');
    const parse = require('csv-parse');
    const transform = require('stream-transform');

    const importEditedEmail = file => {
        logger.info('Organisation edited email import - launch');

        const mailer = require('../../../components/mailer.js')(db, logger, configuration);
        const newOrganismeMailer = require('../../mailing/account/newOrganismeMailer')(db, logger, configuration, mailer);

        const launchTime = new Date().getTime();
        let parser = parse({ delimiter: ',', quote: '"' });

        let input = fs.createReadStream(file, { encoding: 'utf-8' });

        let found = 0;
        let notFound = 0;
        let updated = 0;

        let transformer = transform(async (record, callback) => {
            let organisation = await db.collection('organismes').findOne({ courriel: record[0] });

            if (organisation !== null) {
                found++;
                db.collection('organismes').update({ courriel: organisation.courriel }, { $set: { editedCourriel: record[1] } }, {}, (err, count) => {
                    if (err) {
                        logger.error(err);
                    } else {
                        updated += count;
                        newOrganismeMailer.sendEmailBySiret(organisation.meta.siretAsString);
                        callback(null);
                    }
                });
            } else {
                notFound++;
            }
        }, { parallel: 10 }).on('finish', function() {
            logger.info(`Organisation edited email import - completed (${found} organisation found; ${updated} emails updated, ${notFound} organisation not found, ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')}`);
        });
        input.pipe(parser).pipe(transformer);
    };

    return {
        importEditedEmail: importEditedEmail
    };
};
