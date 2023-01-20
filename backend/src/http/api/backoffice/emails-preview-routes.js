const express = require('express');
const moment = require('moment');
const Joi = require('joi');
const { tryAndCatch, sendHTML } = require('../../utils/routes-utils');

module.exports = ({ emails, middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = middlewares.createJWTAuthMiddleware('backoffice');

    let getPreviewData = (user, previewResponsableParam = false) => {
        return {
            organisme: {
                siret: '123456789000000',
                token: 'token-organisme',
                codeRegion: user.codeRegion,
                score: { nb_avis: !previewResponsableParam? 1 : 0 },
            },
            stagiaire: {
                token: 'token-stagiaire',
                codeRegion: user.codeRegion,
                individu: {
                    prenom: 'Paul',
                    nom: 'Dupond',
                },
                formation: {
                    intitule: 'Formation coiffure',
                    action: {
                        organisme_formateur: {
                            raison_sociale: 'Centre de formation'
                        },
                        session: {
                            periode: {
                                debut: moment().subtract(7, 'days').toDate(),
                                fin: new Date(),
                            },
                        }
                    }
                },
            },
            avis: {
                token: 'token-avis',
                codeRegion: user.codeRegion,
                commentaire: {
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

        const previewResponsable = templateName === 'activationCompteEmailResponsable';
        const templateNameReformule = previewResponsable ? 'activationCompteEmail': templateName;
        let message = emails.getEmailMessageByTemplateName(templateNameReformule);

        let preview = getPreviewData(req.user, previewResponsableParam = previewResponsable);
        let html = await message.render(preview[type === 'organismes' ? 'organisme' : 'stagiaire'], preview.avis);

        return sendHTML(res, html);
    }));

    return router;
};
