module.exports = async db => {

    //Create missing titleMasked property
    await db.collection('comment').updateMany({ comment: { $exists: true }, titleMasked: { $exists: false } }, {
        $set: { 'titleMasked': false },
    });

    let results = await db.collection('comment').updateMany({ comment: { $exists: true } }, {
        $rename: { 'titleMasked': 'comment.titleMasked' },
    });

    return {
        updated: results.result.nModified,
    };
};
