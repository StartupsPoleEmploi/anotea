module.exports = db => {
    return db.collection('comment').updateMany({ archived: { $exists: false } }, { $set: { 'archived': false } });
};
