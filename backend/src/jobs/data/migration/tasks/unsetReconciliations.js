module.exports = db => {

    return db.collection('comment').updateMany({}, {
        $unset: {
            'meta.reconciliations.formation': 1,
            'meta.reconciliations.action': 1,
            'meta.reconciliations.session': 1,
        }
    });
};
