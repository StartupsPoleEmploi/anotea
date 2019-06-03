module.exports = db => {
    return db.collection('carif').drop();
};
