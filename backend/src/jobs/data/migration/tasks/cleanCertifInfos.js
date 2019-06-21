module.exports = db => {
    return Promise.all([
        db.collection('trainee').updateMany({
            $or: [
                { 'training.certifInfo.id': null },
                { 'training.certifInfo.id': 'NULL' },
            ]
        }, {
            $set: {
                'training.certifInfo.id': ''
            }
        }),
        db.collection('comment').updateMany({
            $or: [
                { 'training.certifInfo.id': null },
                { 'training.certifInfo.id': 'NULL' },
            ]
        }, {
            $set: {
                'training.certifInfo.id': ''
            }
        })
    ]);
};
