module.exports = async db => {
    return Promise.all([
        db.collection('trainee').updateMany({ 'training.codeFinanceur': null }, {
            $set: {
                'training.codeFinanceur': [],
            }
        }),
        db.collection('comment').updateMany({ 'training.codeFinanceur': null }, {
            $set: {
                'training.codeFinanceur': [],
            }
        })
    ]);
};
