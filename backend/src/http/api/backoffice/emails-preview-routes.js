const express = require('express');
const moment = require('moment');
const Joi = require('joi');
const { tryAndCatch, sendHTML } = require('../../utils/routes-utils');

module.exports = ({ emails, middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = middlewares.createJWTAuthMiddleware('backoffice');

    let getPreviewData = user => {
        return {
            organisme: {
                siret: '123456789000000',
                token: 'token-organisme',
                codeRegion: user.codeRegion,
            },
            stagiaire: {
                token: 'token-stagiaire',
                codeRegion: user.codeRegion,
                personal: {
                    firstName: 'Paul',
                    name: 'Dupond',
                },
                training: {
                    title: 'Formation coiffure',
                    startDate: moment().subtract(7, 'days').toDate(),
                    scheduledEndDate: new Date(),
                    organisation: {
                        name: 'Centre de formation'
                    }
                },
            },
            comment: {
                token: 'token-comment',
                codeRegion: user.codeRegion,
                comment: {
                    text: 'Super formation. Par contre les locaux sont trop petits',
                },
                reponse: {
                    text: 'Merci pour votre retour nous allons déménager bientôt.',
                }
            }
        };
    };

    router.get('/api/backoffice/emails-preview/:type/templates/:templateName', checkAuth, tryAndCatch(async (req, res) => {

        const { type, templateName } = await Joi.validate(req.params, {
            type: Joi.string().valid(['organismes', 'stagiaires']).required(),
            templateName: Joi.string().required(),
        }, { abortEarly: false });

        let message = emails.getEmailMessageByTemplateName(templateName);

        let preview = getPreviewData(req.user);
        let html = await message.render(preview[type === 'organismes' ? 'organisme' : 'stagiaire'], preview.comment);

        return sendHTML(res, html);
    }));

    return router;
};
