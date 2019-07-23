module.exports = db => {
    return db.collection('comment').removeMany({ trainee: { $exists: true }, step: { $exists: true } });
};
