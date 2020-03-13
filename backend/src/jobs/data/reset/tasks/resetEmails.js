const moment = require('moment');
const { getNbModifiedDocuments } = require('../../../job-utils');
const faker = require('faker');

faker.locale = 'fr';

module.exports = async db => {
    let [questionnaire, questionnaire6Mois, organisme] = await Promise.all([
        db.collection('stagiaires').updateMany(
            {},
            {
                $set: {
                    individu: {
                        nom: faker.name.lastName(),
                        prenom: faker.name.firstName(),
                        email: faker.internet.email(),
                        telephones: [faker.phone.phoneNumber('06########')],
                        emailValid: true,
                        identifiant_pe: faker.phone.phoneNumber('##########'),
                        identifiant_local: faker.phone.phoneNumber('##########'),
                    },
                },
            }
        ),
        db.collection('stagiaires').updateMany(
            {
                avisCreated: false,
                mailSent: true,
                importDate: { $gte: moment().subtract(1, 'months').toDate() },
            },
            {
                $set: {
                    mailSent: false,
                },
                $unset: {
                    mailSentDate: 1,
                    mailRetry: 1,
                }
            }
        ),
        db.collection('stagiaires').updateMany(
            {
                'mailing.questionnaire6Mois': { $exists: true },
                'importDate': { $gte: moment().subtract(1, 'months').toDate() },
            },
            {
                $unset: {
                    'mailing.questionnaire6Mois': 1,
                }
            }
        ),
        db.collection('accounts').updateMany(
            {
                profile: 'organisme',
            },
            {
                $unset: {
                    newCommentsNotificationEmailSentDate: 1,
                    mailSent: 1,
                    mailSentDate: 1,
                }
            }
        ),
    ]);

    return {
        questionnaire: getNbModifiedDocuments(questionnaire),
        questionnaire6Mois: getNbModifiedDocuments(questionnaire6Mois),
        organisme: getNbModifiedDocuments(organisme),
    };
};
