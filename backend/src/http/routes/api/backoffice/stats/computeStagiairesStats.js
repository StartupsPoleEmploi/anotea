module.exports = async (db, query) => {

    let results = await db.collection('trainee').aggregate([
        {
            $match: query
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                nbEmailsEnvoyes: { $sum: { $cond: [{ $eq: ['$mailSent', true] }, 1, 0] } },
                nbAvisDeposes: { $sum: { $cond: [{ $eq: ['$avisCreated', true] }, 1, 0] } },
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
