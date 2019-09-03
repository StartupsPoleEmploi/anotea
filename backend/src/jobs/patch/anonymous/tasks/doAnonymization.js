const { getAnonymizedTitle } = require('../utils')();

module.exports = db => {
    return new Promise((resolve, reject) => {
        let stream = db.collection('trainee').find().sort().stream();
        let promises = [];

        stream.on('data', trainee => {
            const result = getAnonymizedTitle(trainee);

            if (result.changeDetected) {
                const query = { token: trainee.token };

                const update = {
                    $set: {
                        'training.title': result.anonymizedTitle,
                        'anonymized': true,
                        'meta.patch.training.title': trainee.training.title
                    }
                };

                let p = Promise.all([
                    db.collection('trainee').updateOne(query, update),
                    db.collection('comment').updateOne({ token: trainee.token }, update)
                ]);

                promises.push(p);
            }
        });

        stream.on('error', () => {
            reject();
        });

        stream.on('end', async () => {
            await Promise.all(promises);
            resolve();
        });
    });
};
