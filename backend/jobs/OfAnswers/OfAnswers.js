module.exports = (db, logger) => {

    const moment = require('moment');

    // const SINCE = moment().subtract(15, 'months').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const launchTime = new Date().getTime();

    let filter = { answer: {$ne: null} };
    let count = 0;
    let notcount = 0;

    const archive = (collection) => {

        let stream = db.collection(`${collection}`).find(filter).stream();

        stream.on('data', comment => {
            if (comment !== null) {
                count++;
                db.collection('comment').update(
                    { _id: comment._id },
                    { $set: {
                            'response.text': comment.answer,
                            'response.reported': false,
                            'response.date': new Date(),
                            'response.moderated': false,
                            'response.published': false,
                            'response.rejected': false}
                            },
                    {multi: true}, (err, count) => {
                    if (err) {
                        logger.error(err);
                    } else {
                        // updated += count;
                        db.collection('comment').update({}, {$rename: { "response": "answer" }}, {multi: true});
                        // db.collection('test').update({}, {$unset: {answer: 1}}, {multi: true});
                        // callback(null);
                    }
                });
            } else {
                notcount++;
            }
            // console.log(comment);
        });

        stream.on('end', () => {
            logger.info(`Old archiving - completed ${count}s, ${notcount} comment not found, 
            ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
        });

    };

    return {
        archive: archive
    };

};
