module.exports = db => {
    return Promise.all([
        db.collection('trainee').updateMany(
            {
                avisCreated: false,
                mailSent: true
            },
            {
                $unset: {
                    mailSent: 1,
                    mailSentDate: 1,
                }
            }
        ),
        db.collection('trainee').updateMany(
            {
                'mailing.questionnaire6Mois': { $exists: true },
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
};
