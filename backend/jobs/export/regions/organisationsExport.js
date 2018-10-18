module.exports = function(db, logger, configuration, devMode, callback) {

    logger.info('Organisation account export : launch');

    const moment = require('moment');
    const fs = require('fs');
    const path = require('path');
    const filename = path.join(configuration.exports.path, 'organismes.csv');
    let stream = db.collection('organismes').find({ passwordHash: { $ne: null } }).stream();
    let count = 0;
    const launchTime = new Date();

    fs.writeFileSync(filename, 'SIRET;Raison Sociale;Date envoi du dernier email;Email de contact\n', 'utf8');

    stream.on('data', function(organisation) {
        count++;
        let line = `"${organisation.SIRET}";${organisation.raisonSociale};${moment(organisation.mailSentDate).format('DD/MM/YYYY')};${organisation.courriel}`;
        fs.appendFileSync(filename, `${line}\n`, 'utf8');
    });

    stream.on('end', function() {
        logger.info(`Organisation account export - completed (${count} exported, , ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
        if (callback) {
            callback();
        }
    });
};
