module.exports = async db => {
    await db.collection('intercarif_organismes_responsables').aggregate([
        {
            $project: {
                _id: 0,
                organisme_formateurs: 1,
            }
        },
        {
            $unwind: '$organisme_formateurs'
        },
        //Remove organisme formateur with same SIRET
        {
            $group: {
                _id: '$organisme_formateurs.siret',
                unique: { $first: '$$ROOT' }
            }
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ['$unique.organisme_formateurs']
                }
            }
        },
        {
            $addFields: {
                _id: '$siret',
            }
        },
        {
            $out: 'intercarif_organismes_formateurs'
        }
    ], { allowDiskUse: true }).toArray();

    await Promise.all([
        db.collection('intercarif_organismes_formateurs').createIndex({ 'siret': 1 }, { unique: true }),
        db.collection('intercarif_organismes_formateurs').createIndex({ 'numero': 1 }),
    ]);

    return db.collection('intercarif_organismes_formateurs').countDocuments();
};


