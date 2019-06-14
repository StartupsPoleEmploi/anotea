module.exports = db => {

    return db.collection('comment').updateMany(
        {},
        { $rename: { 'meta.originalCertifInfo': 'meta.patch.certifInfo' } },
        { upsert: false },
    );
};
