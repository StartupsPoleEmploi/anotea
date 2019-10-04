module.exports = db => {
    return db.collection('events').removeMany({});
};
