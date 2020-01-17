module.exports = db => {

    return Promise.all([
        db.collection('kairos').drop().catch(() => ({})),
    ]);
};
