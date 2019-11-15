const Joi = require('joi');
const _ = require('lodash');
const nodemailer = require('nodemailer');

module.exports = function(db, configuration) {

    let hostname = configuration.app.public_hostname;
    let getPublicUrl = path => `${hostname}${path}`;
    let getRegionEmail = region => region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from;
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


    return {
        createRegionalMailer: region => {
            return {
                sendEmail: async (emailAddress, message, options = {}) => {

                    let { subject, body } = await Joi.validate(message, {
                        subject: Joi.string().required(),
                        body: Joi.object({
                            text: Joi.string().required(),
                            html: Joi.string(),
                        }).required(),
                    }, { abortEarly: false });

                    let smtpOptions = {
                        ...options,
                        bcc: process.env.ANOTEA_MAIL_BCC ? { bcc: process.env.ANOTEA_MAIL_BCC } : {},
                    };

                    return transporter.sendMail(_.merge({}, {
                        to: emailAddress,
                        subject,
                        from: `Anotea <${configuration.smtp.from}>`,
                        replyTo: `Anotea <${getRegionEmail(region)}>`,
                        list: {
                            help: { url: getPublicUrl('/faq') },
                        },
                        text: body.text,
                        ...(body.html ? { html: body.html } : {}),
                    }, smtpOptions));
                }
            };
        }
    };
};
