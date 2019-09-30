module.exports = db => {
    return Promise.all([
        db.collection('events').remove({}).catch(() => ({})),
    ]);
};
