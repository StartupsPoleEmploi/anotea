module.exports = db => {

    return Promise.all([
        db.collection('trainee').rename('stagiaires').catch(() => ({})),
        db.collection('importTrainee').rename('jobs').catch(() => ({})),
    ]);
};
