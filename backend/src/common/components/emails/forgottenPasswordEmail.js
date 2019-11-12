const emailHelper = require('../../../smtp/emailHelper');
const uuid = require('node-uuid');
const getOrganismeEmail = require('../../utils/getOrganismeEmail');

module.exports = (db, mailer, configuration, regions) => {

    let helper = emailHelper(configuration);
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

    let build = async (account, token, options = {}) => {

        let link = helper.getPublicUrl(`/admin/reinitialisation-mot-de-passe?forgottenPasswordToken=${token}`);
        let consultationLink = helper.getPublicUrl(`/mail/${token}/passwordForgotten`);

        let params = {
            link,
            hostname: helper.getHostname(),
            codeRegion: account.codeRegion,
            profile: account.profile,
            consultationLink,
            ...options,
        };

        let [html, text] = await Promise.all([
            helper.templateHTML('password_forgotten', params),
            helper.templateText('password_forgotten', params),
        ]);

        return { html, text };
    };

    return {
        build,
        send: async account => {
            let email = account.profile === 'organisme' ? getOrganismeEmail(account) : account.courriel;
            let passwordToken = uuid.v4();
            let region = regions.findRegionByCodeRegion(account.codeRegion);

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


            let content = await build(account, passwordToken, { webView: false });

            return mailer.sendNewEmail(email, region, {
                subject: 'Votre compte Anotéa : Demande de renouvellement de mot de passe',
                ...content,
            })
            .then(() => _onSuccess(account))
            .catch(async err => {
                await _onError(err, account);
                throw err;
            });
        },
    };
};
