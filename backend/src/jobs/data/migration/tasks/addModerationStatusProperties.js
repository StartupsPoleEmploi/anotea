module.exports = db => {
    return Promise.all([
        db.collection('comment').updateMany(
            { 'comment': { $exists: true }, 'moderated': { $ne: true } },
            {
                $set: {
                    moderated: false,
                }
            }
        ),
        db.collection('comment').updateMany(
            { 'comment': { $exists: true }, 'published': { $ne: true } },
            {
                $set: {
                    published: false,
                }
            }
        ),
        db.collection('comment').updateMany(
            { 'comment': { $exists: true }, 'rejected': { $ne: true } },
            {
                $set: {
                    rejected: false,
                }
            }
        ),
        db.collection('comment').updateMany(
            { 'comment': { $exists: true }, 'reported': { $ne: true } },
            {
                $set: {
                    reported: false,
                }
            }
        ),
    ]);
};
