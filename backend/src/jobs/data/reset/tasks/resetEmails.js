module.exports = db => {
    return Promise.all([
        db.collection('trainee').updateMany(
            {
                avisCreated: false,
                mailSent: true
            },
            {
                $set: {
                    mailSent: false
                }
            }
        ),
        db.collection('accounts').updateMany(
            {
                profile: 'organisme',

            },
            {
                $set: {
                    newCommentsNotificationEmailSentDate: null,
                    mailSentDate: null,
                    passwordHash: null
                }
            }
        )
    ]);
};
