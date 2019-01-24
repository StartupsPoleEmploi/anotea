const uuid = require('node-uuid');
const ObjectID = require('mongodb').ObjectID;

module.exports = (db, mailer) => {

    return async (_id, contact, codeRegion) => {
        let passwordToken = uuid.v4();

        let account = await db.collection('account').findOne({ _id });

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
        
        return new Promise((resolve, reject) => {
            mailer.sendPasswordForgotten({ to: contact }, codeRegion, passwordToken,
                async () => {
                    await db.collection('account').update({ _id }, {
                        $set: { mailSentDate: new Date() },
                        $unset: {
                            mailError: '',
                            mailErrorDetail: ''
                        }
                    });
                    await db.collection('events').insertOne({
                        id: _id,
                        profile: account.profile,
                        date: new Date(),
                        type: 'askNewPassword'
                    });
                    resolve();
                },
                async err => {
                    await db.collection('account').update({ _id }, {
                        $set: {
                            mailError: 'smtpError',
                            mailErrorDetail: err
                        }
                    });
                    reject(new Error(err));
                });
        });
    };
};
