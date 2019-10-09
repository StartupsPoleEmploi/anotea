module.exports = async db => {

    let updated = 0;
    //Create missing titleMasked property
    await db.collection('comment').updateMany({ titleMasked: { $exists: false } }, {
        $set: { 'titleMasked': false },
    });

    let results = await db.collection('comment').updateMany({ titleMasked: { $exists: true } }, {
        $rename: { 'titleMasked': 'comment.titleMasked' },
    });

    if (results.result.nModified === 1) {
        updated++;
    }

    return {
        updated,
    };
};
