const moment = require('moment');
const _ = require('lodash');
const faker = require('faker');
const uuid = require('uuid');

faker.locale = 'fr';

const createStagiaire = session => {

    let randomize = value => `${value}-${uuid.v4()}`;
    let getDateInThePast = () => moment().subtract('100', 'days').toDate();
    let formation = session.formation;

    let email = faker.internet.email();
    return {
        token: randomize('token'),
        campaign: 'dataset',
        importDate: getDateInThePast(),
        codeRegion: session.code_region,
        trainee: {
            name: faker.name.lastName(),
            firstName: faker.name.firstName(),
            mailDomain: email.split('@')[1],
            email: email,
            phoneNumbers: [faker.phone.phoneNumber('06########')],
            emailValid: true,
            dnIndividuNational: faker.phone.phoneNumber('##########')
        },
        training: {
            idFormation: formation.numero,
            title: formation.intitule,
            startDate: getDateInThePast(),
            scheduledEndDate: getDateInThePast(),
            organisation: {
                id: formation.action.organisme_formateur.numero,
                siret: formation.action.organisme_formateur.siret,
                label: formation.action.organisme_formateur.raison_sociale,
                name: formation.action.organisme_formateur.raison_sociale,
            },
            place: {
                postalCode: formation.action.lieu_de_formation.code_postal,
                city: formation.action.lieu_de_formation.ville
            },
            certifInfos: formation.certifications.certifinfos,
            formacodes: formation.domaine_formation.formacodes,
            idSession: session.numero,
            infoCarif: {
                numeroAction: formation.action.numero,
                numeroSession: session.numero
            },
            codeFinanceur: formation.action.organisme_financeurs[0],
        },
        unsubscribe: false,
        mailSent: true,
        mailSentDate: getDateInThePast(),
        tracking: {
            firstRead: getDateInThePast(),
            lastRead: getDateInThePast()
        },
        avisCreated: false,
    };
};

module.exports = async (db, options) => {

    let session = await db.collection('sessionsReconciliees').findOne();

    return Promise.all(_.range(options.nbStagiaires || 1000).map(() => {
        let stagiaire = createStagiaire(session);
        return db.collection('trainee').insertOne(stagiaire)
        .then(() => stagiaire.token);
    }));

};
