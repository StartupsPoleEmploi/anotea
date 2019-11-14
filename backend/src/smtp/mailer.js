const path = require('path');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const moment = require('moment');
const { promisify } = require('util');

module.exports = function(db, logger, configuration, regions) {

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

    const getUnsubscribeLink = trainee => {
        return `${configuration.app.public_hostname}/mail/${trainee.token}/unsubscribe`;
    };

    const getTrackingLink = obj => {
        return `${configuration.app.public_hostname}/mail/${obj.token}/track`;
    };

    const getRegionEmail = region => {
        return region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from;
    };

    const getReplyToEmail = region => {
        return `Anotea <${getRegionEmail(region)}>`;
    };

    const buildContent = (template, params, options) => {
        let renderFile = promisify(ejs.renderFile);

        if (options.textOnly) {
            return renderFile(path.join(__dirname, `views/${template}.txt`), params);
        }

        return Promise.all([
            renderFile(path.join(__dirname, `views/${template}.txt`), params),
            renderFile(path.join(__dirname, `views/${template}.ejs`), params),
        ]);
    };

    const sendMail = (template, params, mailOptions, options = {}) => {
        if (process.env.ANOTEA_MAIL_BCC) {
            mailOptions.bcc = process.env.ANOTEA_MAIL_BCC;
        }
        mailOptions.from = `Anotea <${configuration.smtp.from}>`;

        params.webView = false;

        return new Promise((resolve, reject) => {
            buildContent(template, params, options)
            .then(values => {
                mailOptions.text = values[0];
                if (!options.textOnly) {
                    mailOptions.html = values[1];
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        logger.error(`An error occurs while sending mail : ${error}̀`);
                        reject(error);
                    } else {
                        logger.info(`Message sent to ${mailOptions.to}`, {
                            messageId: info.messageId,
                            response: info.response,
                        });
                        resolve();
                    }
                });
            }, reason => {
                logger.error(`An error occurs while sending mail : ${reason}`);
                reject(reason);
            });
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
        sendNewEmail: (to, region, options = {}) => {

            let transporterOptions = {
                from: `Anotea <${configuration.smtp.from}>`,
                to: to,
                replyTo: getReplyToEmail(region),
                ...(process.env.ANOTEA_MAIL_BCC ? { bcc: process.env.ANOTEA_MAIL_BCC } : {}),
                subject: `Pôle Emploi`,
                list,
                ...options,
            };

            return new Promise((resolve, reject) => {
                transporter.sendMail(transporterOptions, (error, info) => {
                    if (error) {
                        logger.error(`An error occurs while sending mail : ${error}̀`);
                        reject(error);
                    } else {
                        logger.info(`Message sent to ${transporterOptions.to}`, {
                            messageId: info.messageId,
                            response: info.response,
                        });
                        resolve();
                    }
                });
            });
        },
        sendQuestionnaire6MoisMail: (emailAddress, trainee) => {

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

            let mailOptions = {
                to: emailAddress,
                subject: 'Pôle Emploi - Suivi de votre formation',
                replyTo: getReplyToEmail(region),
                list: Object.assign({}, list, {
                    unsubscribe: {
                        url: unsubscribeLink,
                    }
                }),
            };

            return sendMail('questionnaire_6mois', params, mailOptions);

        },
        sendMalformedImport: params => {
            let mailOptions = {
                to: params.source === 'IDF' ? configuration.smtp.idf_error_to : configuration.smtp.pe_error_to,
                cc: configuration.smtp.import_error_cc,
                subject: 'Imports stagiaires IDF : une erreur est survenue',
            };

            return sendMail('malformed_import_idf', params, mailOptions, { textOnly: true });
        },
    };
};
