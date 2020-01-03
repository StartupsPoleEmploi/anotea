module.exports = db => {

    let trainee = db.collection("trainee");

    let getCampaignReconciliesStats = async () => {

        return trainee.aggregate([
            {
                $group: {
                    _id: "$campaign",
                    date: { $min: "$mailSentDate" },
                    mailSent: { $sum: { $cond: ["$mailSent", 1, 0] } },
                    mailOpen: { $sum: { $cond: ["$tracking.firstRead", 1, 0] } },
                    linkClick: { $sum: { $cond: ["$tracking.click", 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: "comment",
                    let: {
                        campaign: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$campaign", "$$campaign"] },
                                    ]
                                },
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                nbAvis: { $sum: 1 },
                                nbCommentaires: {
                                    $sum: {
                                        $cond: {
                                            if: { $not: ["$comment"] },
                                            then: 0,
                                            else: 1,
                                        }
                                    }
                                },
                                nbCommentairesRejected: {
                                    $sum: {
                                        $cond: {
                                            if: { $eq: ["$status", "rejected"] },
                                            then: 1,
                                            else: 0,
                                        }
                                    }
                                },
                            }
                        },
                    ],
                    as: "stats"
                }
            },
            {
                $unwind:
                    {
                        path: "$stats",
                        preserveNullAndEmptyArrays: true
                    }
            },
            {
                $group: {
                    _id: "$_id",
                    date: { $first: "$date" },
                    mailSent: { $first: "$mailSent" },
                    mailOpen: { $first: "$mailOpen" },
                    linkClick: { $first: "$linkClick" },
                    formValidated: { $first: "$stats.nbAvis" },
                    nbCommentaires: { $first: "$stats.nbCommentaires" },
                    nbCommentairesRejected: { $first: "$stats.nbCommentairesRejected" },
                }
            },
            {
                $sort: {
                    date: -1
                }
            }
        ]).toArray();

    };

    return getCampaignReconciliesStats();
};
