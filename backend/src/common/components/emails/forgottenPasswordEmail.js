const uuid = require('uuid');

module.exports = (db, regions, mailer, templates) => {

    return account => {

        let region = regions.findRegionByCodeRegion(account.codeRegion);
        let regionalMailer = mailer.createRegionalMailer(region);

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

        let render = (passwordToken, options = {}) => {
            let link = templates.getPublicUrl(`/admin/reinitialisation-mot-de-passe?forgottenPasswordToken=${passwordToken}`);

            return templates.render('forgotten_password', {
                link,
                codeRegion: account.codeRegion,
                profile: account.profile,
                consultationLink: templates.getPublicUrl(`/mail/${passwordToken}/passwordForgotten`),
                ...options,
            });
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

        let onError = err => {
            return db.collection('accounts').update({ _id: account._id }, {
                $set: {
                    mailError: 'smtpError',
                    mailErrorDetail: err
                }
            });
        };

        return {
            render,
            send: emailAddress => {
                return generateForgottenPasswordToken()
                .then(async passwordToken => {

                    let body = await render(passwordToken, { webView: false });

                    return regionalMailer.sendEmail(
                        emailAddress,
                        {
                            subject: 'Votre compte Anotéa : Demande de renouvellement de mot de passe',
                            body,
                        },
                    );
                })
                .then(onSuccess)
                .catch(onError);
            },
        };
    };
};
