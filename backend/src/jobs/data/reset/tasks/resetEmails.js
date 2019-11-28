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
        db.collection('accounts').updateMany(
            {
                profile: 'organisme',
                passwordHash: { $ne: null }
            },
            {
                $unset: {
                    newCommentsNotificationEmailSentDate: 1,
                    mailSent: 1,
                    mailSentDate: 1,
                }
            }
        )
    ]);
};
