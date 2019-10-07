module.exports = async db => {
    return db.collection('accounts').updateMany({ features: { $exists: true } }, {
        $unset: {
            features: 1,
        }
    });
};
