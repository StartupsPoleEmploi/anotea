module.exports = db => {

    return Promise.all([
        db.collection('accounts').insertOne({
            profile: 'financeur',
            courriel: 'cr',
            codeRegion: '11',
            codeFinanceur: '2',
        }),
        db.collection('accounts').insertOne({
            profile: 'moderateur',
            courriel: 'moderateur@pole-emploi.fr',
            codeRegion: '11',
        }),
    ]);
};
