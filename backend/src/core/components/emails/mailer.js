const Joi = require("joi");
const _ = require("lodash");
const htmlToText = require("nodemailer-html-to-text").htmlToText;
const nodemailer = require("nodemailer");
const moment = require("moment");
const path = require("path");
const mjml = require("mjml");
const ejs = require("ejs");
const { promisify } = require("util");
const renderFile = promisify(ejs.renderFile);

module.exports = (configuration, regions) => {

    let transporter = nodemailer.createTransport({
        name: configuration.smtp.hostname,
        host: configuration.smtp.host,
        port: configuration.smtp.port,
        secure: configuration.smtp.secure,
        greetingTimeout: configuration.smtp.greetingTimeout,
        tls: {
            rejectUnauthorized: false
        },
        ...(!configuration.smtp.user ? {} : {
            auth: {
                user: configuration.smtp.user,
                pass: configuration.smtp.password
            }
        })
    });
    transporter.use("compile", htmlToText({ ignoreImage: true }));

    let getRegionEmail = region => region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from;
    let getPublicUrl = path => `${(configuration.app.public_hostname)}${path}`;

    let utils = {
        getPublicUrl,
        getUTM: campaign => `utm_source=PE&utm_medium=mail&utm_campaign=${campaign}`,
        getRegionEmail: region => region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from,
        getUnsubscribeLink: token => getPublicUrl(`/emails/stagiaires/${token}/unsubscribe`),
        getConsultationLink: (type, templateName, token, commentToken) => {
            const params = commentToken ? `?avis=${commentToken}` : "";
            return getPublicUrl(`/emails/${type}/${token}/templates/${templateName}${params}`);
        },
    };

    return {
        utils,
        render: async (rootDir, templateName, data = {}) => {
            let doc = (data.account || data.organisme || data.trainee);
            let mjmlTemplate = await renderFile(path.join(rootDir, `${templateName}.mjml.ejs`), {
                ...data,
                ...(doc ? { region: regions.findRegionByCodeRegion(doc.codeRegion) } : {}),
                templateName,
                utils: { moment, ...utils },
            });
            return mjml(mjmlTemplate, { minify: true }).html;
        },
        createRegionalMailer: region => {
            return {
                sendEmail: async (emailAddress, message, options = {}) => {

                    let { subject, body } = await Joi.validate(message, {
                        subject: Joi.string().required(),
                        body: Joi.string().required(),
                    }, { abortEarly: false });

                    return transporter.sendMail(_.merge({}, {
                        to: emailAddress,
                        subject,
                        from: `Anotea <${configuration.smtp.from}>`,
                        replyTo: `Anotea <${getRegionEmail(region)}>`,
                        list: {
                            help: getPublicUrl("/faq"),
                        },
                        html: body,
                    }, {
                        ...options,
                        ...(process.env.ANOTEA_MAIL_BCC ? { bcc: process.env.ANOTEA_MAIL_BCC } : {}),
                    }));
                }
            };
        }
    };
};
