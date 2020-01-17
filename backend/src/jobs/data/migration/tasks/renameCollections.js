module.exports = async db => {

    await Promise.all([
        db.collection('trainee').rename('stagiaires').catch(() => ({})),
        db.collection('importTrainee').rename('jobs').catch(() => ({})),
    ]);

    return { renamed: true };
};
