module.exports = (db, logger) => {

    const moment = require('moment');

    const SINCE = moment().subtract(15, 'months').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const launchTime = new Date().getTime();

    let filter = { 'training.scheduledEndDate': { $lte: new Date(SINCE) } };
    let count = 0;

    const archive = (sourceCollection, destinationCollection) => {

        let stream = db.collection(`${sourceCollection}`).find(filter).stream();

        stream.on('data', comment => {
            count++;
            db.collection(`${destinationCollection}`).insert(comment, function(error) {
                if (error) {
                    logger.error('error', error);
                } else {
                    db.collection(`${sourceCollection}`).remove(filter);
                }
            });
        });

        stream.on('end', () => {
            logger.info(`Old ${sourceCollection}s archiving - completed (${count} ${sourceCollection}s, 
            ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
        });

    };

    return {
        archive: archive
    };

};
