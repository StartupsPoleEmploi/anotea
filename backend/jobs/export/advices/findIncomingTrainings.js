module.exports = function(db, logger, configuration, callback) {

    const moment = require('moment');

    logger.info('Find incoming training sessions: launch');

    const launchTime = new Date().getTime();

    let total = 0;
    let totalSession = 0;

    const today = moment(new Date()).format('YYYYMMDD');
    db.collection('incomingAdvices').remove({});

    let streamAdvice = db.collection('comment').find({
        step: { $gte: 2 },
        $or: [{ published: true }, { comment: null }]
    }).stream();

    const findSessions = advice => {
        let streamSessions = db.collection('intercarif').find({
            '_attributes.numero': advice.training.idFormation,
            'actions.sessions': { $elemMatch: { 'periode.debut': { $gte: today } } }
        }).stream();
        streamSessions.on('data', function(formation) {
            totalSession++;
            let actions = [];
            let sessions = [];

            actions = formation.actions.map(action => {
                sessions.push(action.sessions.map(session => {
                    return session._attributes.numero;
                }));
                return action._attributes.numero;
            });

            let projectedAdvice = {
                date: advice.date,
                idAdvice: advice._id,
                id_of: advice.training.organisation.id,
                id_formation: advice.training.idFormation,
                trainingTitle: advice.training.title,
                formacode: advice.training.formacode,
                startDate: advice.training.startDate,
                scheduledEndDate: advice.training.scheduledEndDate,
                rates: advice.rates,
                pseudo: advice.pseudo,
                comment: advice.comment,
                accord: advice.accord,
                trainingId: formation._attributes.numero,
                actions: actions,
                sessions: sessions,
                answer: advice.answer,
                codeRegion: advice.codeRegion
            };

            if (advice.pseudoMasked) {
                delete projectedAdvice.pseudo;
            }

            if (advice.titleMasked && advice.comment) {
                delete projectedAdvice.comment.title;
            }

            if (advice.editedComment) {
                projectedAdvice.comment.text = advice.editedComment.text;
            }

            db.collection('incomingAdvices').save(projectedAdvice);
        });
    };

    streamAdvice.on('data', function(advice) {
        total++;
        findSessions(advice);
    });

    streamAdvice.on('end', function() {
        logger.info(`Find incoming training sessions - completed (${totalSession} advices with training session matched over ${total} advices => ${Math.round(totalSession / total * 10000) / 100}%, ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);

        if (callback) {
            callback();
        }
    });

};
