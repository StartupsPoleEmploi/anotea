module.exports = db => {

    return Promise.all([
        db.collection('accounts').insertOne({
            profile: 'financeur',
            identifiant: 'financeur',
            codeRegion: '11',
            codeFinanceur: '2',
        }),
        db.collection('accounts').insertOne({
            profile: "admin",
            identifiant: "admin",
            codeRegion: "11",
            codeFinanceur: '4',
        }),
        db.collection('accounts').insertOne({
            profile: 'moderateur',
            identifiant: 'moderateur',
            codeRegion: '11',
        }),
    ]);
};
