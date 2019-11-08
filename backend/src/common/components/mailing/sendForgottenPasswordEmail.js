const uuid = require('node-uuid');

module.exports = (db, mailer) => {

    let _onSuccess = async account => {
        await db.collection('accounts').update({ _id: account._id }, {
            $set: { mailSentDate: new Date() },
            $unset: {
                mailError: '',
                mailErrorDetail: ''
            }
        });
        await db.collection('events').insertOne({
            id: account._id,
            profile: account.profile,
            date: new Date(),
            type: 'askNewPassword'
        });
    };

    let _onError = (err, account) => {
        return db.collection('accounts').update({ _id: account._id }, {
            $set: {
                mailError: 'smtpError',
                mailErrorDetail: err
            }
        });
    };


    return async (_id, contact, codeRegion) => {
        let passwordToken = uuid.v4();
        let account = await db.collection('accounts').findOne({ _id });

        await db.collection('forgottenPasswordTokens').removeOne({
            id: _id,
            profile: account.profile
        });

        await db.collection('forgottenPasswordTokens').insertOne({
            creationDate: new Date(),
            token: passwordToken,
            id: _id,
            profile: account.profile
        });

        return mailer.sendForgottenPasswordEmail(contact, codeRegion, passwordToken, account.profile)
        .then(() => _onSuccess(account))
        .catch(async err => {
            await _onError(err, account);
            throw err;
        });
    };
};
