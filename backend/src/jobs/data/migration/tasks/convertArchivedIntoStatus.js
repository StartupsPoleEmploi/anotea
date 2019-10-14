module.exports = async db => {
    let [notArchived, archived] = await Promise.all([
        db.collection('comment').updateMany(
            { 'archived': false },
            {
                $unset: {
                    archived: 1,
                }
            }
        ),
        db.collection('comment').updateMany(
            { 'archived': true },
            {
                $set: {
                    status: 'archived',
                },
                $unset: {
                    archived: 1,
                }
            }
        ),
    ]);

    return { notArchived, archived };
};
