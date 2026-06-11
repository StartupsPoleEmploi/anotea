const Joi = require('joi');
const _ = require('lodash');
const moment = require('moment');
const path = require('path');
const mjml2html = require('mjml');
const ejs = require('ejs');
const { promisify } = require('util');
const renderFile = promisify(ejs.renderFile);
const fetch = require('node-fetch').default;
const { badRequest } = require('@hapi/boom');


module.exports = (configuration, regions, authMail) => {

    const mailV1 = Joi.object({
        subject: Joi.string().required(),
        body: Joi.string().required(),
    });
    const mailV2 = Joi.object({
        codeMessage: Joi.string().required(),
        usager: Joi.boolean(),
        //mot de passe oublie
        forgottenPasswordToken: Joi.string(),
        //questionnaire
        stagiaireToken: Joi.string(),
        campaign: Joi.string(),
        formationIntitule: Joi.string(),
        formationDebut: Joi.string(),
        formationFin: Joi.string(),
        organismeFormateurRaisonSociale: Joi.string(),
        //mail aux organisme
        organismeToken: Joi.string(),
        siret: Joi.string(), 
        texteReponse: Joi.string(),
        avisToken: Joi.string(),
        texteAvis: Joi.string().allow(''),
        dispensateur: Joi.string(),
        nbUnreadCommentaires: Joi.string(),
    });


    let getRegionEmail = region => region.contact ? `${region.contact}@francetravail.fr` : configuration.smtp.from;
    let getPublicUrl = path => `${(configuration.app.public_hostname)}${path}`;

    let utils = {
        getPublicUrl,
        getUTM: campaign => `utm_source=PE&utm_campaign=${campaign}`,
        getRegionEmail: region => region.contact ? `${region.contact}@francetravail.fr` : configuration.smtp.from,
        getUnsubscribeLink: token => getPublicUrl(`/emails/stagiaires/${token}/unsubscribe`),
        getConsultationLink: (type, templateName, token, commentToken) => {
            const params = commentToken ? `?avis=${commentToken}` : '';
            return getPublicUrl(`/emails/${type}/${token}/templates/${templateName}${params}`);
        },
    };

    return {
        utils,
        render: async (rootDir, templateName, data = {}) => {
            let doc = (data.account || data.organisme || data.stagiaire);
            let mjmlTemplate = await renderFile(path.join(rootDir, `${templateName}.mjml.ejs`), {
                ...data,
                ...(doc ? { region: regions.findRegionByCodeRegion(doc.codeRegion) } : {}),
                templateName,
                utils: { moment, ...utils },
            });
            return mjml2html(mjmlTemplate);
        },
        createRegionalMailer: region => {
            return {
                sendEmail: async (emailAddress, message, options = {}) => {
                    throw badRequest(`could not send mail (v1)`);
                }
            };
        },
        createRegionalMailerV2: region => {
            return {
                sendEmail: async (emailAddress, message, options = {}) => {
                    const {
                        codeMessage,
                        usager,
                        forgottenPasswordToken,
                        stagiaireToken,
                        campaign,
                        formationIntitule,
                        formationDebut,
                        formationFin,
                        organismeFormateurRaisonSociale,
                        organismeToken,
                        siret, 
                        texteReponse,
                        avisToken,
                        texteAvis,
                        dispensateur,
                        nbUnreadCommentaires,
                    } = Joi.attempt(message, mailV2, '', { abortEarly: false });

                    const restOptions = {
                        method: 'POST',
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            authorization: `Bearer ${await authMail.getTokenSendMail()}`,
                        },
                        body: JSON.stringify({
                            codeMessage: codeMessage,
                            destinataires: [
                                {
                                    '@type': 'Personnalise',
                                    adresseMail: emailAddress
                                }
                            ],
                            destinataireReponse: { '@type': 'Personnalise', nom: 'Anotea', adresseMail: getRegionEmail(region) },
                            expediteur: {
                                '@type': 'Personnalise',
                                nom: 'Anotea',
                                adresseMail: usager ? configuration.smtp.usagerFrom : configuration.smtp.from
                            },
                            variablesComposition: [
                                {
                                    nom: 'contact',
                                    '@type': 'Texte',
                                    valeur: getRegionEmail(region)
                                },
                                ...(region.codeRegion && region.conseil_regional.active ? [{
                                    nom: 'codeRegion',
                                    '@type': 'Texte',
                                    valeur: region.codeRegion
                                }, {
                                    nom: 'nomRegion',
                                    '@type': 'Texte',
                                    valeur: region.nom
                                }] : []),
                                ...(region.carif.active ? [{
                                    nom: 'carif',
                                    '@type': 'Texte',
                                    valeur: region.carif.nom
                                }] : []),
                                ...(forgottenPasswordToken ? [{
                                    nom: 'forgottenPasswordToken',
                                    '@type': 'Texte',
                                    valeur: forgottenPasswordToken
                                }] : []),
                                ...(stagiaireToken ? [{
                                    nom: 'stagiaireToken',
                                    '@type': 'Texte',
                                    valeur: stagiaireToken
                                }] : []),
                                ...(campaign ? [{
                                    nom: 'utm',
                                    '@type': 'Texte',
                                    valeur: utils.getUTM(campaign)
                                }] : []),
                                ...(formationIntitule ? [{
                                    nom: 'formationIntitule',
                                    '@type': 'Texte',
                                    valeur: formationIntitule
                                }] : []),
                                ...(formationDebut ? [{
                                    nom: 'formationDebut',
                                    '@type': 'Texte',
                                    valeur: formationDebut
                                }] : []),
                                ...(formationFin ? [{
                                    nom: 'formationFin',
                                    '@type': 'Texte',
                                    valeur: formationFin
                                }] : []),
                                ...(organismeFormateurRaisonSociale ? [{
                                    nom: 'organismeFormateurRaisonSociale',
                                    '@type': 'Texte',
                                    valeur: organismeFormateurRaisonSociale
                                }] : []),
                                ...(organismeToken ? [{
                                    nom: 'organismeToken',
                                    '@type': 'Texte',
                                    valeur: organismeToken
                                }] : []),
                                ...(siret ? [{
                                    nom: 'siret',
                                    '@type': 'Texte',
                                    valeur: siret
                                }] : []),
                                ...(texteReponse ? [{
                                    nom: 'texteReponse',
                                    '@type': 'Texte',
                                    valeur: texteReponse
                                }] : []),
                                ...(avisToken ? [{
                                    nom: 'avisToken',
                                    '@type': 'Texte',
                                    valeur: avisToken
                                }] : []),
                                ...(texteAvis ? [{
                                    nom: 'texteAvis',
                                    '@type': 'Texte',
                                    valeur: texteAvis
                                }] : []),
                                ...(dispensateur ? [{
                                    nom: 'dispensateur',
                                    '@type': 'Texte',
                                    valeur: dispensateur
                                }] : []),
                                ...(nbUnreadCommentaires ? [{
                                    nom: 'nbUnreadCommentaires',
                                    '@type': 'Texte',
                                    valeur: nbUnreadCommentaires
                                }] : []),
                            ],
                        }),
                    };

                    const url = configuration.ftmail.api_url;

                    const response = await fetch(url, restOptions);
                    if (response.ok) {
                       const data = await response.json();

                        //the mail has an uuid that can be logged if needed
                        return data.uuid;
                    } else {
                        const errorText = await response.text();
                        const truncatedError = errorText ? 
                           errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText
                           : '';
                        console.error(`Failed to send mail, Status: ${response.status}, Error response:', ${truncatedError}`);
                        throw badRequest(`could not send mail`);
                    }
                }
            };
        }
    };
};
