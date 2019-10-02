module.exports = async db => {
    return db.collection('comment').updateMany({ comment: { $exists: false } }, {
        $unset: {
            reported: 1,
            moderated: 1,
            published: 1,
            rejected: 1,
            rejectReason: 1,
            qualification: 1,
        }
    });
};
