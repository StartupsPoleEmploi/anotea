const Joi = require('joi');

module.exports = trainee => {

    return Joi.validate(trainee, {
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
        trainee: {
            name: Joi.string().required(),
            firstName: Joi.string().allow('').required(),
            mailDomain: Joi.string().required(),
            email: Joi.string().email().required(),
            phoneNumbers: Joi.array().items(Joi.string().allow('')),
            emailValid: Joi.boolean().required(),
            dnIndividuNational: Joi.string().allow(null).required(),
            idLocal: Joi.string().allow(null).required(),
        },
        training: {
            idFormation: Joi.string().allow(null).required(),
            origineSession: Joi.string().allow(null).required(),
            title: Joi.string().required(),
            startDate: Joi.date().required(),
            scheduledEndDate: Joi.date().required(),
            organisation: {
                id: Joi.string().allow(null).required(),
                siret: Joi.string().min(9).max(15).required(),
                label: Joi.string().allow('').required(),
                name: Joi.string().required()
            },
            place: {
                departement: Joi.string().optional(),
                postalCode: Joi.string().regex(/^(([0-8][0-9])|(9[0-5])|(2[ab])|(97))[0-9]{3}$/).required(),
                city: Joi.string().required()
            },
            certifInfo: {
                id: Joi.string().allow(null).allow('').required(),
                label: Joi.string().allow(null).allow('').required()
            },
            idSession: Joi.string().allow(null).required(),
            formacode: Joi.string().allow(null).required(),
            aesRecu: Joi.string().allow(null),
            referencement: Joi.string().allow(null).required(),
            infoCarif: {
                numeroSession: Joi.string().allow(null).required(),
                numeroAction: Joi.string().allow(null).required()
            },
            codeFinanceur: Joi.array().items(Joi.string()).required(),
            niveauEntree: Joi.any().allow(null).required(),
            niveauSortie: Joi.any().allow(null).required(),
            dureeHebdo: Joi.any().allow(null).required(),
            dureeMaxi: Joi.any().allow(null).required(),
            dureeEntreprise: Joi.any().allow(null).required(),
            dureeIndicative: Joi.string().allow(null).allow('').required(),
            nombreHeuresCentre: Joi.any().allow(null).required(),
            infoRegion: Joi.object().optional(),
        }
    }, { abortEarly: false });
};
