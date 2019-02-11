module.exports = db => {
    return db.collection('sessionsReconciliees').aggregate([
        {
            $group: {
                _id: '$formation.action.numero',
                formation: { $first: '$formation' },
                region: { $first: '$region' },
                code_region: { $first: '$code_region' },
                meta: { $first: '$meta' },
                avis: { $push: '$avis' },
                accueil: { $avg: '$score.notes.accueil' },
                contenu_formation: { $avg: '$score.notes.contenu_formation' },
                equipe_formateurs: { $avg: '$score.notes.equipe_formateurs' },
                moyen_materiel: { $avg: '$score.notes.moyen_materiel' },
                accompagnement: { $avg: '$score.notes.accompagnement' },
                global: { $avg: '$score.notes.global' },
            }
        },
        // Convert session into action
        {
            $replaceRoot: {
                newRoot: {
                    _id: { $concat: ['$formation.numero', '|', '$formation.action.numero'] },
                    numero: '$formation.action.numero',
                    region: '$region',
                    code_region: '$code_region',
                    avis: {
                        $reduce: {
                            input: '$avis',
                            initialValue: [],
                            in: { $setUnion: ['$$value', '$$this'] }
                        }
                    },
                    score: {
                        nb_avis: { $size: '$avis' },
                        notes: {
                            accueil: '$accueil',
                            contenu_formation: '$contenu_formation',
                            equipe_formateurs: '$equipe_formateurs',
                            moyen_materiel: '$moyen_materiel',
                            accompagnement: '$accompagnement',
                            global: '$global'
                        }
                    },
                    formation: '$formation',
                    meta: '$meta',
                },
            },
        },
        // Remove action property from formation
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

