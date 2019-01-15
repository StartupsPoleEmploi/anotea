

module.exports = (db, mailer) => {

    let _onSuccess = trainee => {
        return db.collection('trainee').updateOne({ '_id': trainee._id }, {
            $set: {
                mailSent: true,
                mailSentDate: new Date(),
            },
            $unset: {
                mailError: '',
                mailErrorDetail: ''
            }
        });
    };

    let _onError = (err, trainee) => {
        return db.collection('trainee').updateOne({ '_id': trainee._id }, {
            $set: {
                mailSent: true,
                mailError: 'smtpError',
                mailErrorDetail: err.message
            }
        });
    };

    return trainee => {
        return new Promise((resolve, reject) => {
            mailer.sendVotreAvisMail({ to: trainee.trainee.email }, trainee,
                async () => {
                    await _onSuccess(trainee);
                    resolve();
                },
                async err => {
                    await _onError(err, trainee);
                    reject(new Error(err));
                });
        });
    };
};
