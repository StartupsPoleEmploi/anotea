const moment = require('moment');
const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let [questionnaire, questionnaire6Mois, organisme] = await Promise.all([
        db.collection('trainee').updateMany(
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
        db.collection('trainee').updateMany(
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
