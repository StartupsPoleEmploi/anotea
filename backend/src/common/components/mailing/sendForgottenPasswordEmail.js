const uuid = require('node-uuid');

module.exports = (db, mailer) => {

    const profile = [];
    profile['organismes'] = 'organisme';
    profile['financer'] = 'financer';
    profile['moderator'] = 'moderateur';

    return async (_id, contact, collectionName, codeRegion) => {
        let passwordToken = uuid.v4();

        await db.collection('forgottenPasswordTokens').insertOne({ token: passwordToken, id: _id, profile: profile[collectionName] });
        return new Promise((resolve, reject) => {
            mailer.sendPasswordForgotten({ to: contact }, codeRegion, passwordToken,
                async () => {
                    await db.collection('organismes').update({ _id }, {
                        $set: { mailSentDate: new Date() },
                        $unset: {
                            mailError: '',
                            mailErrorDetail: ''
                        }
                    });
                    await db.collection('events').insertOne({
                        id: _id,
                        profile: profile[collectionName],
                        date: new Date(),
                        type: 'askNewPassword'
                    });
                    resolve();
                },
                async err => {
                    await db.collection(collectionName).update({ _id }, {
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
