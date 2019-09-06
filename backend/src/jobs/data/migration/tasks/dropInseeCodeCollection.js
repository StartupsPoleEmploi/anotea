module.exports = db => {
    return Promise.all([
        db.collection('inseeCode').drop().catch(() => ({})),
    ]);
};

