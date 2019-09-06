module.exports = async db => {

    let [trainee, comment, reconciliations] = await Promise.all([
        db.collection('trainee').updateMany({ 'meta.refreshed': { $exists: true } }, { $unset: { 'meta.refreshed': 1 } }),
        db.collection('comment').updateMany({ 'meta.refreshed': { $exists: true } }, { $unset: { 'meta.refreshed': 1 } }),
        db.collection('comment').updateMany(
            {
                $or: [
                    { 'meta.reconciliations.formation': { $exists: true } },
                    { 'meta.reconciliations.action': { $exists: true } },
                    { 'meta.reconciliations.session': { $exists: true } },
                ]
            },
            {
                $unset: {
                    'meta.reconciliations.$[].formation': true,
                    'meta.reconciliations.$[].action': true,
                    'meta.reconciliations.$[].session': true,
                }
            }
        ),
    ]);

    return {
        trainee: trainee.result.nModified,
        comment: comment.result.nModified,
        reconciliations: reconciliations.result.nModified,
    };
};

