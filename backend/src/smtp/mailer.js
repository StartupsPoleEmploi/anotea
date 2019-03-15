const path = require('path');

module.exports = function(db, logger, configuration) {

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

    const getContact = carif => {
        return carif.courriel !== undefined ? carif.courriel : configuration.smtp.from;
    };

    const getFrom = carif => {
        return `Anotea <${getContact(carif)}>`;
    };

    const getCarif = async (codeRegion, successCallback, errorCallback) => {
        const carif = await db.collection('carif').findOne({ codeRegion: codeRegion });
        if (carif === null) {
            errorCallback(`CARIF for region code '${codeRegion}' unknown`);
            return;
        }
        successCallback(carif);
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

            mailOptions.list = list;

            getCarif(organisme.codeRegion, carif => {
                mailOptions.from = getFrom(carif);
                mailOptions.subject = `Pôle Emploi - Vous avez ${data.nbUnreadComments} nouveaux avis stagiaires`;
                const params = {
                    hostname: configuration.app.public_hostname,
                    trackingLink: getTrackingLink(organisme),
                    organisme: organisme,
                    comment: pickedComment ? pickedComment.comment.text : null,
                    contact: getContact(carif)
                };
                sendMail('organisme_avis_non_lus', params, mailOptions, successCallback, errorCallback);
            }, errorCallback);
        },
        sendOrganisationAccountLink: async (mailOptions, organisation, successCallback, errorCallback) => {
            mailOptions.subject = 'Pôle Emploi vous donne accès aux avis de vos stagiaires';

            const link = getOrganisationPasswordLink(organisation);
            const trackingLink = getTrackingLink(organisation);

            mailOptions.list = list;

            getCarif(organisation.codeRegion, carif => {
                mailOptions.from = getFrom(carif);
                const params = {
                    link: link,
                    trackingLink: trackingLink,
                    hostname: configuration.app.public_hostname,
                    organisation: organisation,
                    contact: getContact(carif)
                };
                sendMail('organisation_password', params, mailOptions, successCallback, errorCallback);
            }, errorCallback);
        },
        sendPasswordForgotten: async (mailOptions, codeRegion, passwordToken, successCallback, errorCallback) => {
            mailOptions.subject = 'Votre compte Anotéa : Demande de renouvellement de mot de passe';

            const link = getPasswordForgottenLink(passwordToken);

            mailOptions.list = list;
  
            getCarif(codeRegion, carif => {
                mailOptions.from = getFrom(carif);
                const params = { link: link, hostname: configuration.app.public_hostname, codeRegion: codeRegion };
                sendMail('password_forgotten', params, mailOptions, successCallback, errorCallback);
            }, errorCallback);
        },
        sendVotreAvisMail: async (mailOptions, trainee, successCallback, errorCallback) => {
            mailOptions.subject = `${trainee.trainee.firstName} ${trainee.trainee.name}, donnez un avis sur votre formation en 1 minute`;

            const consultationLink = getConsultationLink(trainee);
            const unsubscribeLink = getUnsubscribeLink(trainee);
            const formLink = getFormLink(trainee);
            const trackingLink = getTrackingLink(trainee);

            mailOptions.list = Object.assign({}, list, {
                unsubscribe: {
                    url: unsubscribeLink,
                }
            });

            getCarif(trainee.codeRegion, carif => {
                mailOptions.from = getFrom(carif);
                const params = {
                    trainee: trainee,
                    consultationLink: consultationLink,
                    unsubscribeLink: unsubscribeLink,
                    formLink: formLink,
                    trackingLink: trackingLink,
                    hostname: configuration.app.public_hostname,
                    moment: moment,
                    carifNameHidden: carif.carifNameHidden,
                    carifName: carif.name,
                    carifEmail: mailOptions.from
                };
                sendMail('votre_avis', params, mailOptions, successCallback, errorCallback);
            }, errorCallback);

        },
        sendMalformedImport: async (params, successCallback, errorCallback) => {
            let mailOptions = {};
            mailOptions.to = params.source === 'IDF' ? configuration.smtp.idf_error_to : configuration.smtp.pe_error_to;
            mailOptions.subject = 'Imports stagiaires IDF : une erreur est survenue';
            mailOptions.from = configuration.smtp.from;
            const cc = configuration.smtp.import_error_cc;
            sendMail('malformed_import_idf', params, mailOptions, successCallback, errorCallback, cc, true);
        },
        sendInjureMail: async (mailOptions, trainee, comment, successCallback, errorCallback) => {
            mailOptions.subject = `Rejet de votre avis sur votre formation ${trainee.training.title} à ${trainee.training.organisation.name}`;

            const consultationLink = getConsultationLink(trainee);
            const unsubscribeLink = getUnsubscribeLink(trainee);
            const formLink = getFormLink(trainee);
            const trackingLink = getTrackingLink(trainee);

            mailOptions.list = Object.assign({}, list, {
                unsubscribe: {
                    url: unsubscribeLink,
                }
            });

            getCarif(trainee.codeRegion, carif => {
                mailOptions.from = getFrom(carif);
                const params = {
                    comment: comment,
                    trainee: trainee,
                    consultationLink: consultationLink,
                    unsubscribeLink: unsubscribeLink,
                    formLink: formLink,
                    trackingLink: trackingLink,
                    hostname: configuration.app.public_hostname,
                    carifEmail: mailOptions.from,
                    moment: moment
                };
                sendMail('avis_injure', params, mailOptions, successCallback, errorCallback);
            }, errorCallback);
        }
    };
};
