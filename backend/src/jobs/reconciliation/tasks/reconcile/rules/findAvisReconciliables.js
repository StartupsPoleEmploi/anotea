module.exports = (db, formation) => {

    return db.collection('comment').find({
        $and: [
            {
                'training.organisation.siret': {
                    $in: formation.actions.map(action => {
                        let siren = action.organisme_formateur.siret_formateur.siret.substring(0, 9);
                        return new RegExp(`^${siren}`);
                    })
                }
            },
            {
                $or: [
                    { 'training.certifInfo.id': { $in: formation._meta.certifinfos } },
                    { 'formacode': { $in: formation._meta.formacodes } },
                ]
            },
        ],
        $or: [
            { 'comment': { $exists: false } },
            { 'published': true },
            { 'rejected': true },
        ]
    })
    .project({
        _id: 1,
        training: 1,
        rates: 1,
        date: 1,
        formacode: 1,
        codeFinanceur: 1,
        comment: 1,
        pseudo: 1,
        pseudoMasked: 1,
        rejected: 1,
        editedComment: 1,
        reponse: 1,
    })
    .toArray();
};
