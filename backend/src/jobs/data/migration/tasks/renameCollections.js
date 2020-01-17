module.exports = async db => {

    await Promise.all([
        db.collection('comment').rename('avis'),
        db.collection('trainee').rename('stagiaires'),
        db.collection('importTrainee').rename('jobs'),
    ]);

    return { renamed: true };
};
