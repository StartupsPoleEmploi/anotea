const uuid = require('uuid');

module.exports = (db, regions, mailer) => {

    const templateName = 'forgottenPasswordEmail';

    let render = (account, passwordToken, options = {}) => {
        return mailer.render(__dirname, templateName, {
            account,
            link: mailer.utils.getPublicUrl(`/backoffice/reinitialisation-mot-de-passe?forgottenPasswordToken=${passwordToken}`),
            ...options,
        });
    };

    return {
        templateName,
        render,
        send: account => {
            let generateForgottenPasswordToken = async () => {
                let passwordToken = uuid.v4();

                await db.collection('forgottenPasswordTokens').removeOne({
                    id: account._id,
                    profile: account.profile
                });

                await db.collection('forgottenPasswordTokens').insertOne({
                    id: account._id,
                    profile: account.profile,
                    creationDate: new Date(),
                    token: passwordToken,
                });

                return passwordToken;
            };

            let onSuccess = async () => {
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

            let onError = async err => {
                await db.collection('accounts').update({ _id: account._id }, {
                    $set: {
                        mailError: 'smtpError',
                        mailErrorDetail: err
                    }
                });
                throw err;
            };

            return generateForgottenPasswordToken()
            .then(async passwordToken => {

                let region = regions.findRegionByCodeRegion(account.codeRegion);

                return mailer.createRegionalMailer(region).sendEmail(
                    account.courriel,
                    {
                        subject: 'Votre compte Anotéa : Demande de renouvellement de mot de passe',
                        body: await render(account, passwordToken),
                    },
                );
            })
            .then(onSuccess)
            .catch(onError);
        },
    };
};
