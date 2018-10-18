db.carif.insert({
    codeRegion: '17',
    name: 'Orientation Pays de la Loire',
    url: 'http://www.orientation-paysdelaloire.fr/',
    courriel: 'anotea-pdll.44116@pole-emploi.fr',
    formLinkEnabled: false
});
db.carif.insert({ codeRegion: '11', name: 'Défi Métiers', url: 'https://www.defi-metiers.fr/', formLinkEnabled: true });
db.carif.createIndex({ codeRegion: 1 });
