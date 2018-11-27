let titleize = require('underscore.string/titleize');

module.exports = (db, logger, mailer) => {

    return {
        sendEmails: (handler, filters) => {
            return new Promise(async (resolve, reject) => {

                let promises = [];
                let stats = {
                    total: 0,
                    sent: 0,
                    error: 0,
                };

                let cursor = db.collection('trainee').find(handler.getQuery(filters));

                if (filters.limit) {
                    cursor.limit(filters.limit);
                }

                while (await cursor.hasNext()) {
                    const trainee = await cursor.next();
                    trainee.trainee.firstName = titleize(trainee.trainee.firstName);
                    trainee.trainee.name = titleize(trainee.trainee.name);

                    promises.push(
                        new Promise(async (resolve, reject) => {
                            mailer.sendVotreAvisMail({ to: trainee.trainee.email }, trainee, async () => {
                                await handler.onSuccess(trainee);
                                stats.sent++;
                                return resolve();
                            }, async err => {
                                await handler.onError(err, trainee);
                                logger.error(err);
                                stats.error++;
                                return reject();
                            });
                        })
                    );
                }

                await Promise.all(promises);
                return stats.error === 0 ? resolve(stats) : reject(stats);
            });
        }
    };
};
