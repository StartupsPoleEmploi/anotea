module.exports = db => {
    return db.collection('sessionsReconciliees').aggregate([
        {
            $group: {
                _id: '$formation.action.numero',
                session: { $first: '$$ROOT' },
            }
        },
        // Convert session into action
        {
            $replaceRoot: {
                newRoot: {
                    _id: { $concat: ['$session.formation.numero', '|', '$_id'] },
                    numero: '$_id',
                    region: '$session.region',
                    code_region: '$session.code_region',
                    avis: '$session.avis',
                    score: '$session.score',
                    formation: '$session.formation',
                    meta: '$session.meta',
                },
            },
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ['$formation.action', '$$ROOT']
                }
            }
        },
        {
            $project: {
                'formation.action': 0,
            },
        },
        //Output documents into target collection
        {
            $out: 'actionsReconciliees'
        }
    ], { allowDiskUse: true }).toArray();
};

