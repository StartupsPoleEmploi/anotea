module.exports = async db => {

    await db.collection('comment').updateMany({ editComment: { $exists: true } }, {
        $set: {
            'meta.original.comment.text': '$comment.text'
        },
    });

    await db.collection('comment').updateMany({ editComment: { $exists: true } }, {
        $rename: { 'editComment.text': 'comment.text' },
    });

    return db.collection('comment').updateMany({ 'editComment': { $exists: true } }, {
        $unset: { 'editComment': 1 },
    });
};
