const moment = require('moment');
const _ = require('lodash');
const faker = require('faker');
const uuid = require('uuid');

faker.locale = 'fr';

const createStagiaire = avis => {

    let getDateInThePast = () => moment().subtract('100', 'days').toDate();

    let email = faker.internet.email();
    return {
        campaign: 'dataset',
        importDate: getDateInThePast(),
        trainee: {
            name: faker.name.lastName(),
            firstName: faker.name.firstName(),
            mailDomain: email.split('@')[1],
            email: email,
            phoneNumbers: [faker.phone.phoneNumber('06########')],
            emailValid: true,
            dnIndividuNational: faker.phone.phoneNumber('##########')
        },
        training: avis.training,
        unsubscribe: false,
        mailSent: true,
        token: avis.token,
        mailSentDate: getDateInThePast(),
        tracking: {
            firstRead: getDateInThePast(),
            lastRead: getDateInThePast()
        },
        codeRegion: '11',
        avisCreated: true,
    };
};

const buildAvis = (session, custom = {}) => {

    let randomize = value => `${value}-${uuid.v4()}`;
    let getDateInThePast = () => moment().subtract('100', 'days').toDate();
    let formation = session.formation;

    return _.merge({
        token: randomize('token'),
        campaign: 'dataset',
        archived: false,
        formacode: formation.domaine_formation.formacodes[0],
        idSession: session.numero,
        codeRegion: session.code_region,
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
            certifInfo: {
                id: formation.certifications.certifinfos[0],
                label: 'NULL'
            },
            idSession: session.numero,
            formacode: formation.domaine_formation.formacodes[0],
            aesRecu: 'AES',
            referencement: 'XXXXXXXXXXXX',
            idSessionAudeFormation: '2422722',
            infoCarif: {
                numeroAction: formation.action.numero,
                numeroSession: session.numero
            },
            codeFinanceur: formation.action.organisme_financeurs[0],
        },
        rates: {
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            accompagnement: 1,
            global: 2.1,
        },
        pseudo: faker.name.firstName(),
        date: getDateInThePast(),
        importDate: getDateInThePast(),
        unsubscribe: false,
        tracking: {
            firstRead: getDateInThePast(),
        },
    }, custom);
};

const buildComment = () => {
    return {
        title: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
    };
};

const buildReponse = () => {

    //TODO add a component to be able to reuse reply action
    return {
        text: faker.lorem.paragraph(),
        date: new Date(),
        status: 'none',
    };
};

module.exports = async (db, moderation, options = {}) => {

    let promises = [];
    let generateRandom = () => {
        let range = (number, getData = () => ({})) => _.range(number).map(() => getData());

        return [
            ...range(20),
            ...range(20, () => ({ reponse: buildReponse() })),
            ...range(20, () => ({ comment: buildComment() })),
            ...range(20, () => ({ comment: buildComment(), reponse: buildReponse() })),
        ];
    };

    let session = await db.collection('sessionsReconciliees').findOne();

    promises.push(
        ...(options.published || generateRandom()).map(data => {
            let avis = buildAvis(session, data);
            return Promise.all([
                db.collection('trainee').insertOne(createStagiaire(avis)),
                db.collection('comment').insertOne(avis),
            ])
            .then(() => moderation.publish(avis._id, 'positif'));
        })
    );

    promises.push(
        ...(options.rejected || generateRandom()).map(data => {
            let avis = buildAvis(session, data);
            return Promise.all([
                db.collection('trainee').insertOne(createStagiaire(avis)),
                db.collection('comment').insertOne(avis),
            ])
            .then(() => moderation.reject(avis._id, 'alerte'));
        })
    );

    promises.push(
        ...(options.reported || generateRandom()).map(data => {
            let avis = buildAvis(session, data);
            return Promise.all([
                db.collection('trainee').insertOne(createStagiaire(avis)),
                db.collection('comment').insertOne(avis),
            ])
            .then(() => moderation.report(avis._id));
        })
    );

    promises.push(
        ...(options.toModerate || generateRandom()).map(data => {
            let avis = buildAvis(session, data);
            return Promise.all([
                db.collection('trainee').insertOne(createStagiaire(avis)),
                db.collection('comment').insertOne(avis),
            ]);
        })
    );

    return Promise.all(promises);

};
