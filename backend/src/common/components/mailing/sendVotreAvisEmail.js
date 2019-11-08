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

    return async trainee => {
        await mailer.sendVotreAvisMail(trainee.trainee.email, trainee)
        .then(() => _onSuccess(trainee))
        .catch(async err => {
            await _onError(err, trainee);
            throw err;
        });
    };
};
