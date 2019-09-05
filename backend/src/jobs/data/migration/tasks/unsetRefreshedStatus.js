module.exports = async db => {


    let [trainee, comment] = await Promise.all([
        db.collection('trainee').updateMany({ 'meta.refreshed': { $exists: true } }, { $unset: { 'meta.refreshed': 1 } }),
        db.collection('comment').updateMany({ 'meta.refreshed': { $exists: true } }, { $unset: { 'meta.refreshed': 1 } }),
    ]);

    return {
        trainee: trainee.result.nModified,
        comment: comment.result.nModified,
    };
};

