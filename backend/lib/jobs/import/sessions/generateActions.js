module.exports = db => {
    return db.collection('sessionsReconciliees').aggregate([
        {
            $group: {
                _id: '$meta.source.numero_action',
                session: { $first: '$$ROOT' },
            }
        },
        // Convert session into action
        {
            $replaceRoot: {
                newRoot: {
                    _id: { $concat: ['$session.meta.source.numero_formation', '|', '$_id'] },
                    numero: '$_id',
                    region: '$session.region',
                    avis: '$session.avis',
                    score: '$session.score',
                    meta: {
                        reconciliation: '$session.meta.reconciliation',
                        source: {
                            type: 'intercarif',
                            numero_formation: '$session.meta.source.numero_formation',
                            numero_action: '$_id',
                        },
                    },
                },
            },
        },
        //Output documents into target collection
        {
            $out: 'actionsReconciliees'
        }
    ], { allowDiskUse: true }).toArray();
};

