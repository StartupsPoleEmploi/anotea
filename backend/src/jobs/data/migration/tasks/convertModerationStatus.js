module.exports = async db => {
    let [notes, invalid, moderated, published, rejected, reported] = await Promise.all([
        db.collection('comment').updateMany(
            { 'comment': { $exists: false } },
            {
                $set: {
                    status: 'published',
                },
                $unset: {
                    moderated: 1,
                    published: 1,
                    reported: 1,
                    rejected: 1,
                }
            }
        ),
        db.collection('comment').updateMany(
            { moderated: true, rejected: false, published: false, reported: false },
            {
                $set: {
                    status: 'none',
                },
                $unset: {
                    moderated: 1,
                    published: 1,
                    reported: 1,
                    rejected: 1,
                }
            }
        ),
        db.collection('comment').updateMany(
            { 'comment': { $exists: true }, 'moderated': false },
            {
                $set: {
                    status: 'none',
                },
                $unset: {
                    moderated: 1,
                    published: 1,
                    reported: 1,
                    rejected: 1,
                }
            }
        ),
        db.collection('comment').updateMany(
            { 'comment': { $exists: true }, 'published': true },
            {
                $set: {
                    status: 'published',
                },
                $unset: {
                    moderated: 1,
                    published: 1,
                    reported: 1,
                    rejected: 1,
                }
            }
        ),
        db.collection('comment').updateMany(
            { 'comment': { $exists: true }, 'reported': true },
            {
                $set: {
                    status: 'reported',
                },
                $unset: {
                    moderated: 1,
                    published: 1,
                    reported: 1,
                    rejected: 1,
                }
            }
        ),
        db.collection('comment').updateMany(
            { 'comment': { $exists: true }, 'rejected': true },
            {
                $set: {
                    status: 'rejected',
                },
                $unset: {
                    moderated: 1,
                    published: 1,
                    reported: 1,
                    rejected: 1,
                }
            }
        ),
    ]);

    return { notes, moderated, invalid, published, rejected, reported };
};
