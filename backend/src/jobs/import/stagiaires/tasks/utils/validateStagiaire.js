const Joi = require('joi');

module.exports = stagiaire => {

    return Joi.validate(stagiaire, {
        _id: Joi.string().required(),
        campaign: Joi.string().required(),
        campaignDate: Joi.date().required(),
        sourceIDF: Joi.boolean().optional(),
        avisCreated: Joi.boolean().required(),
        importDate: Joi.date().required(),
        unsubscribe: Joi.boolean().required(),
        mailSent: Joi.boolean().required(),
        token: Joi.string().required(),
        codeRegion: Joi.string().required(),
        refreshKey: Joi.string().required(),
        personal: {
            name: Joi.string().required(),
            firstName: Joi.string().allow('').required(),
            mailDomain: Joi.string().required(),
            email: Joi.string().email().required(),
            phoneNumbers: Joi.array().items(Joi.string().allow('')),
            emailValid: Joi.boolean().required(),
            dnIndividuNational: Joi.string().allow(null).required(),
            idLocal: Joi.string().allow(null).required(),
        },
        formation: {
            numero: Joi.string().allow(null).required(),
            intitule: Joi.string().required(),
            domaine_formation: Joi.object().keys({
                formacodes: Joi.array().items(Joi.string()).required(),
            }),
            certifications: Joi.array().items(Joi.object().keys({
                certif_info: Joi.string(),
            })).required(),
            action: {
                numero: Joi.string().allow(null).required(),
                lieu_de_formation: {
                    code_postal: Joi.string().regex(/^(([0-8][0-9])|(9[0-5])|(97))[0-9]{3}$/).required(),
                    ville: Joi.string().required(),
                },
                organisme_financeurs: Joi.array().items(Joi.object().keys({
                    code_financeur: Joi.string().required(),
                })).required(),
                organisme_formateur: {
                    raison_sociale: Joi.string().required(),
                    label: Joi.string().allow('').required(),
                    siret: Joi.string().min(9).max(15).required(),
                    numero: Joi.string().allow(null).required(),
                },
                session: {
                    id: Joi.string().allow(null).required(),
                    numero: Joi.string().allow(null).required(),
                    periode: {
                        debut: Joi.date().required(),
                        fin: Joi.date().required(),
                    },
                },
            },
        },
    }, { abortEarly: false });
};
