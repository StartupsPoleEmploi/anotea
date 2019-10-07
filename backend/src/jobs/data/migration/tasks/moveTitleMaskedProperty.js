module.exports = async db => {

    //Create missing titleMasked property
    await db.collection('comment').updateMany({ titleMasked: { $exists: false } }, {
        $set: { 'titleMasked': false },
    });

    return db.collection('comment').updateMany({ titleMasked: { $exists: true } }, {
        $rename: { 'titleMasked': 'comment.titleMasked' },
    });
};
