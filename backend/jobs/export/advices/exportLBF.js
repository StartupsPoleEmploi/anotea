module.exports = function(db, logger, configuration, callback) {

    const fs = require('fs');
    const path = require('path');
    const moment = require('moment');
    const dataExposer = require('../../../components/dataExposer')();

    logger.info('Advices export for LBF : launch');

    const launchTime = new Date().getTime();

    let count = 0;

    db.collection('exportLBF').remove({});
    let stream = db.collection('comment').find({
        step: { $gte: 2 },
        $or: [{ published: true }, { comment: null }]
    }).stream();

    stream.on('data', function(advice) {
        let obj = dataExposer.buildAdviceLBF(advice);
        obj._id = obj.id;
        delete obj.id;
        db.collection('exportLBF').save(obj);
    });

    stream.on('end', function() {
        let result = [];

        let streamProjected = db.collection('incomingAdvices').find().stream();

        streamProjected.on('data', function(advice) {
            let obj = dataExposer.buildProjectedAdviceLBF(advice);
            obj._id = obj.id;
            delete obj.id;
            db.collection('exportLBF').save(obj);
        });

        streamProjected.on('end', function() {
            let finalStream = db.collection('exportLBF').find().stream();

            finalStream.on('data', function(advice) {
                count++;
                result.push(advice);
            });

            finalStream.on('end', function() {
                fs.writeFileSync(path.join(configuration.exports.path, 'avisLBF.json'), JSON.stringify(result), 'utf8');
                db.collection('exportLBF').remove({});
                logger.info(`Advices export for LBF - end (${count} exported, ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
                if (callback) {
                    callback();
                }
            });
        });
    });
};
