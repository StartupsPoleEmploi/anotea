module.exports = async db => {
    return Promise.all([
        db.collection('carif').insertOne({
            codeRegion: '11',
            name: 'Carif web',
            courriel: 'anotea.pe@pole-emploi.fr',
            url: 'https://anotea.pole-emploi.fr',
            formLinkEnabled: true,
            carifNameHidden: false
        })
    ]);
};
