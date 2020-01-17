module.exports = async (db, query) => {

    let results = await db.collection('stagiaires').aggregate([
        {
            $match: query
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                nbEmailsEnvoyes: { $sum: { $cond: [{ $ne: ['$mailSentDate', null] }, 1, 0] } },
            }
        },
        {
            $project: {
                _id: 0,
            }
        }
    ]).toArray();

    let stats = results[0];
    return stats ? stats : {};

};
