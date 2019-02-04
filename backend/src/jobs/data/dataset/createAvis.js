const moment = require('moment');
const faker = require('faker');
const uuid = require('uuid');
const _ = require('lodash');

faker.locale = 'fr';

const createAvis = session => {

    let randomize = value => `${value}-${uuid.v4()}`;
    let getDateInThePast = () => moment().subtract('100', 'days').toDate();
    let formation = session.formation;

    return {
        token: randomize('token'),
        campaign: 'dataset',
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
                id: formation.certifications[0],
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
        step: 3,
        rates: {
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            accompagnement: 1,
            global: 2
        },
        pseudo: faker.name.firstName(),
        comment: {
            title: faker.lorem.sentence(),
            text: faker.lorem.paragraph(),
        },
        date: getDateInThePast(),
        importDate: getDateInThePast(),
        unsubscribe: false,
        tracking: {
            firstRead: getDateInThePast(),
        },
    };
};

module.exports = async (db, moderation) => {

    let session = await db.collection('sessionsReconciliees').findOne();
    let promises = [];

    promises.push(
        ..._.range(250).map(() => {
            return db.collection('comment').insertOne(createAvis(session));
        })
    );

    promises.push(
        ..._.range(5).map(() => {
            let avis = createAvis(session);
            return db.collection('comment').insertOne(avis)
            .then(() => moderation.publish(avis._id, 'positif'));
        })
    );

    promises.push(
        ..._.range(5).map(() => {
            let avis = createAvis(session);
            return db.collection('comment').insertOne(avis)
            .then(() => moderation.reject(avis._id, 'alerte'));
        })
    );

    promises.push(
        ..._.range(5).map(() => {
            let avis = createAvis(session);
            return db.collection('comment').insertOne(avis)
            .then(() => moderation.report(avis._id));
        })
    );

    return Promise.all(promises);

};
