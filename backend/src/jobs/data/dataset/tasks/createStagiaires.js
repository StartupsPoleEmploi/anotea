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
        codeRegion: session.region,
        individu: {
            nom: faker.name.lastName(),
            prenom: faker.name.firstName(),
            email: email,
            telephones: [faker.phone.phoneNumber('06########')],
            emailValid: true,
            identifiant_pe: faker.phone.phoneNumber('##########')
        },
        formation: {
            numero: formation.numero,
            intitule: formation.intitule,
            domaine_formation: formation.domaine_formation,
            certifications: formation.certifications,
            action: {
                numero: formation.action.numero,
                lieu_de_formation: formation.action.lieu_de_formation,
                organisme_financeurs: formation.action.organisme_financeurs,
                organisme_formateur: formation.action.organisme_formateur,
                organisme_responsable: formation.organisme_responsable,
                session: {
                    numero: session.numero,
                    periode: session.periode,
                },
            },
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
        return db.collection('stagiaires').insertOne(stagiaire)
        .then(() => stagiaire);
    }));

};
