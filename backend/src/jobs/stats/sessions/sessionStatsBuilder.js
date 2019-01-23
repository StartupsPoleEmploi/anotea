module.exports = db => {

    const buildStats = async option => {
        const today = new Date();

        let query = [];
        let outCollection;
        let codeFinancerProject;
        if (option.unwind) {
            query.push({ $unwind: '$code_financeurs' });
            codeFinancerProject = '$code_financeurs';
            outCollection = 'sessionsStatsByCodeFinanceur';
        } else {
            codeFinancerProject = 'all';
            outCollection = 'sessionsStats';
        }

        [
            {
                $match: { code_region: { $ne: null } }
            },
            { $group:
                {
                    _id: { codeRegion: '$code_region', codeFinanceur: codeFinancerProject },
                    count: { $sum: 1 },
                    countWithAdvices: { $sum: { $cond: { if: { $gte: ['$score.nb_avis', 1] }, then: 1, else: 0 } } },
                    countWithMoreThanTwoAdvices: { $sum: { $cond: { if: { $gte: ['$score.nb_avis', 3] }, then: 1, else: 0 } } }
                }
            }
        ].forEach(item => {
            query.push(item);
        });

        const stats = await db.collection('sessionsReconciliees').aggregate(query).toArray();

        stats.forEach(stat => {
            stat._id.year = today.getFullYear();
            stat._id.month = today.getMonth() + 1;
            db.collection(outCollection).updateOne({_id : stat._id}, { $set: { count: stat.count, countWithAdvices: stat.countWithAdvices, countWithMoreThanTwoAdvices: stat.countWithMoreThanTwoAdvices } }, { upsert: true });
        });
    };

    return {
        buildStats: buildStats
    };
};
