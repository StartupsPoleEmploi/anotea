module.exports = async db => {
    return db.collection('comment').updateMany({ answered: { $exists: true } }, { $unset: { answered: 1 } });
};
