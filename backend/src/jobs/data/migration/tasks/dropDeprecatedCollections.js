module.exports = db => {
    return Promise.all([
        db.collection('invalidComments').drop().catch(() => ({})),
    ]);
};

