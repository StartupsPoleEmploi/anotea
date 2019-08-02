const path = require('path');

module.exports = function(db, logger, configuration, regions) {

    const nodemailer = require('nodemailer');
    const ejs = require('ejs');
    const moment = require('moment');

    const configSmtp = {
        host: configuration.smtp.host,
        port: configuration.smtp.port,
        secure: configuration.smtp.secure,
        tls: {
            rejectUnauthorized: false
        },
        name: configuration.smtp.hostname,
        greetingTimeout: configuration.smtp.greetingTimeout
    };

    if (configuration.smtp.user !== undefined) {
        configSmtp.auth = {
            user: configuration.smtp.user,
            pass: configuration.smtp.password
        };
    }

    const transporter = nodemailer.createTransport(configSmtp);

    const getConsultationLink = trainee => {
        return `${configuration.app.public_hostname}/mail/${trainee.token}?utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`;
    };

    const getUnsubscribeLink = trainee => {
        return `${configuration.app.public_hostname}/mail/${trainee.token}/unsubscribe`;
    };

    const getFormLink = trainee => {
        return `${configuration.app.public_hostname}/questionnaire/${trainee.token}?utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`;
    };

    const getTrackingLink = obj => {
        return `${configuration.app.public_hostname}/mail/${obj.token}/track`;
    };

    const getOrganisationPasswordLink = organisation => {
        return `${configuration.app.public_hostname}/admin?action=creation&token=${organisation.token}`;
    };

    const getPasswordForgottenLink = token => {
        return `${configuration.app.public_hostname}/admin?action=passwordLost&token=${token}`;
    };

    const getRegionEmail = region => {
        return region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from;
    };

    const getReplyToEmail = region => {
        return `Anotea <${getRegionEmail(region)}>`;
    };

    const buildContent = (template, extension, params) => {
        return new Promise((resolve, reject) => {
            ejs.renderFile(path.join(__dirname, `views/${template}.${extension}`), params, (err, str) => {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return;
                }
                resolve(str);
            });
        });
    };

    const sendMail = (template, params, mailOptions, successCallback, errorCallback, cc, textOnly) => {
        if (process.env.ANOTEA_MAIL_BCC) {
            mailOptions.bcc = process.env.ANOTEA_MAIL_BCC;
        }

        if (cc) {
            mailOptions.cc = cc;
        }
        mailOptions.from = `Anotea <${configuration.smtp.from}>`;

        params.webView = false;

        let contents = [];
        contents.push(buildContent(template, 'txt', params));
        if (!textOnly) {
            contents.push(buildContent(template, 'ejs', params));
        }

        Promise.all(contents).then(values => {
            mailOptions.text = values[0];
            if (!textOnly) {
                mailOptions.html = values[1];
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    logger.error(`An error occurs while sending mail : ${error}̀`);
                    errorCallback(error);
                } else {
                    logger.info(`Message sent to ${mailOptions.to}`, {
                        messageId: info.messageId,
                        response: info.response,
                    });
                    successCallback();
                }
            });
        }, reason => {
            logger.error(`An error occurs while sending mail : ${reason}`);
            errorCallback(reason);
        });
    };

    const list = {
        help: {
            url: 'https://anotea.pole-emploi.fr/faq'
        },
        unsubscribe: {
            url: 'https://anotea.pole-emploi.fr/admin',
        }
    };

    return {
        getConsultationLink: getConsultationLink,
        getUnsubscribeLink: getUnsubscribeLink,
        getFormLink: getFormLink,
        getPasswordForgottenLink: getPasswordForgottenLink,
        sendNewCommentsNotification: async (mailOptions, data, successCallback, errorCallback) => {

            let { organisme, pickedComment } = data;

            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            let params = {
                hostname: configuration.app.public_hostname,
                consultationLink: `${configuration.app.public_hostname}/mail/${organisme.token}/nonLus`,
                trackingLink: getTrackingLink(organisme),
                organisme: organisme,
                comment: pickedComment ? pickedComment.comment.text : null,
                contact: getRegionEmail(region)
            };

            mailOptions.list = list;
            mailOptions.replyTo = getReplyToEmail(region);
            mailOptions.subject = `Pôle Emploi - Vous avez ${data.nbUnreadComments} nouveaux avis stagiaires`;

            sendMail('organisme_avis_non_lus', params, mailOptions, successCallback, errorCallback);
        },
        sendReponseRejeteeNotification: async (mailOptions, organisme, avis, successCallback, errorCallback) => {

            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            let params = {
                hostname: configuration.app.public_hostname,
                trackingLink: getTrackingLink(organisme),
                consultationLink: `${configuration.app.public_hostname}/mail/${organisme.token}/reponseRejetee/${avis._id}`,
                contact: getRegionEmail(region),
                organisme: organisme,
                reponse: avis.reponse.text
            };

            mailOptions.subject = `Anotéa - votre réponse n'a pas été prise en compte`;
            mailOptions.list = list;
            mailOptions.replyTo = getReplyToEmail(region);

            sendMail('organisme_reponse_rejetee', params, mailOptions, successCallback, errorCallback);
        },
        sendOrganisationAccountLink: async (mailOptions, organisme, successCallback, errorCallback) => {

            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            let params = {
                link: getOrganisationPasswordLink(organisme),
                trackingLink: getTrackingLink(organisme),
                consultationLink: `${configuration.app.public_hostname}/mail/${organisme.token}/password`,
                hostname: configuration.app.public_hostname,
                organisation: organisme,
                contact: getRegionEmail(region)
            };

            mailOptions.subject = 'Pôle Emploi vous donne accès aux avis de vos stagiaires';
            mailOptions.list = list;
            mailOptions.replyTo = getReplyToEmail(region);

            sendMail('organisation_password', params, mailOptions, successCallback, errorCallback);
        },
        sendPasswordForgotten: async (mailOptions, codeRegion, passwordToken, profile, successCallback, errorCallback) => {

            let link = getPasswordForgottenLink(passwordToken);
            let consultationLink = `${configuration.app.public_hostname}/mail/${passwordToken}/passwordForgotten`;
            let params = { link, hostname: configuration.app.public_hostname, codeRegion: codeRegion, profile, consultationLink };
            let region = regions.findRegionByCodeRegion(codeRegion);

            mailOptions.subject = 'Votre compte Anotéa : Demande de renouvellement de mot de passe';
            mailOptions.list = list;
            mailOptions.replyTo = getReplyToEmail(region);

            sendMail('password_forgotten', params, mailOptions, successCallback, errorCallback);
        },
        sendVotreAvisMail: async (mailOptions, trainee, successCallback, errorCallback) => {

            let unsubscribeLink = getUnsubscribeLink(trainee);
            let region = regions.findRegionByCodeRegion(trainee.codeRegion);
            let params = {
                trainee,
                moment,
                region,
                consultationLink: getConsultationLink(trainee),
                unsubscribeLink: unsubscribeLink,
                formLink: getFormLink(trainee),
                trackingLink: getTrackingLink(trainee),
                hostname: configuration.app.public_hostname,
            };

            mailOptions.subject = 'Pôle Emploi vous demande votre avis sur votre formation';
            mailOptions.list = Object.assign({}, list, {
                unsubscribe: {
                    url: unsubscribeLink,
                }
            });
            mailOptions.replyTo = getReplyToEmail(region);

            sendMail('votre_avis', params, mailOptions, successCallback, errorCallback);

        },
        sendQuestionnaire6MoisMail: async (mailOptions, trainee, successCallback, errorCallback) => {

            let unsubscribeLink = getUnsubscribeLink(trainee);
            let region = regions.findRegionByCodeRegion(trainee.codeRegion);
            let params = {
                trainee,
                moment,
                region,
                unsubscribeLink: unsubscribeLink,
                consultationLink: `${configuration.app.public_hostname}/mail/${trainee.token}/6mois?utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`,
                formLink: 'https://avril_la_vae_facile.typeform.com/to/gIFh4q',
                trackingLink: getTrackingLink(trainee),
                hostname: configuration.app.public_hostname,
            };

            mailOptions.subject = 'Pole Emploi - Suivi de votre formation';
            mailOptions.list = Object.assign({}, list, {
                unsubscribe: {
                    url: unsubscribeLink,
                }
            });
            mailOptions.replyTo = getReplyToEmail(region);

            sendMail('questionnaire_6mois', params, mailOptions, successCallback, errorCallback);

        },
        sendMalformedImport: async (params, successCallback, errorCallback) => {
            let mailOptions = {};
            let cc = configuration.smtp.import_error_cc;

            mailOptions.to = params.source === 'IDF' ? configuration.smtp.idf_error_to : configuration.smtp.pe_error_to;
            mailOptions.subject = 'Imports stagiaires IDF : une erreur est survenue';

            sendMail('malformed_import_idf', params, mailOptions, successCallback, errorCallback, cc, true);
        },
        sendInjureMail: async (mailOptions, trainee, comment, successCallback, errorCallback) => {

            let unsubscribeLink = getUnsubscribeLink(trainee);
            let region = regions.findRegionByCodeRegion(trainee.codeRegion);
            let params = {
                trainee,
                comment,
                moment,
                consultationLink: `${configuration.app.public_hostname}/mail/${trainee.token}/injure?utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`,
                unsubscribeLink: unsubscribeLink,
                formLink: getFormLink(trainee),
                hostname: configuration.app.public_hostname,
                email: getReplyToEmail(region)
            };

            mailOptions.subject =
                `Rejet de votre avis sur votre formation ${trainee.training.title} à ${trainee.training.organisation.name}`;
            mailOptions.list = Object.assign({}, list, {
                unsubscribe: {
                    url: unsubscribeLink,
                }
            });
            mailOptions.replyTo = getReplyToEmail(region);
            sendMail('avis_injure', params, mailOptions, successCallback, errorCallback);
        }
    };
};
