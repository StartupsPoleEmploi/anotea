module.exports = async db => {
    return db.collection('comment').updateMany(
        { 'reponse.date': { $exists: true }, 'reponse.lastStatusUpdate': { $exists: false } },
        {
            $set: {
                'reponse.lastStatusUpdate': '$date',
            }
        }
    );
};
