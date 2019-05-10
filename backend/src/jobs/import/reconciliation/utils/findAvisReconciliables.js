module.exports = (db, formation, selectors = {}) => {

    let sirens = selectors.sirets ? selectors.sirets.map(siret => new RegExp(`^${siret.substring(0, 9)}`)) : [];

    return db.collection('comment').find({
        $and: [
            { 'training.organisation.siret': { $in: sirens } },
            selectors.lieu_de_formation ? { 'training.place.postalCode': selectors.lieu_de_formation } : {},
            {
                $or: [
                    { 'training.certifInfo.id': { $in: formation._meta.certifinfos } },
                    { 'formacode': { $in: formation._meta.formacodes } },
                ]
            },
        ],
        $or: [
            { 'comment': { $exists: false } },
            { 'comment': null },
            { 'published': true },
            { 'rejected': true },
        ]
    })
    .project({
        campaign: 0,
        unsubscribe: 0,
        mailSent: 0,
        mailSentDate: 0,
        tracking: 0,
        accord: 0,
        meta: 0,
    })
    .toArray();
};
