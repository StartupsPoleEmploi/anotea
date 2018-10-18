module.exports = function(db, logger, configuration, callback) {

    const moment = require('moment');
    const path = require('path');
    const fs = require('fs');
    const dataExposer = require('../../../components/dataExposer')();

    logger.info('Advices export for DM : launch');

    const launchTime = new Date().getTime();

    let count = 0;
    let total = [];
    let elemCount = [];
    let result = {};

    const stream = db.collection('incomingAdvices').find({ codeRegion: '11' }).stream();

    stream.on('data', function(advice) {
        count++;

        if (advice.actions.length === 0) {
            return;
        }

        const idAF = advice.actions[0];
        if (result[idAF] === undefined) {
            result[idAF] = { noteMoyenne: 0 };
            total[idAF] = 0;
            elemCount[idAF] = 0;
        }
        let adviceObj = dataExposer.buildAdvice(advice);
        advice.sessions.forEach(session => {
            if (result[idAF][session] === undefined) {
                result[idAF][session] = [];
            }
            result[idAF][session].push(adviceObj);
            if (advice.rates && !isNaN(advice.rates.global)) {
                total[idAF] += advice.rates.global;
                elemCount[idAF]++;
                result[idAF].noteMoyenne = Math.round(total[idAF] / elemCount[idAF]);
            }
        });
    });

    stream.on('end', function() {
        fs.writeFileSync(path.join(configuration.exports.path, 'avisDM.json'), JSON.stringify(result), 'utf8');
        logger.info(`Advices export for DM : end (${count} exported, ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
        if (callback) {
            callback();
        }
    });
};
