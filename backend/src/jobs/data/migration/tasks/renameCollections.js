module.exports = db => {

    return Promise.all([
        db.collection('trainee').rename('stagiaires').catch(() => ({})),
    ]);
};
