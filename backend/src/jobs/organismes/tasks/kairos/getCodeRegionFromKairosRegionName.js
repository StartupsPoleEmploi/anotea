let mapper = {
    'Auvergne-Rhône-Alpes': '84',
    'Bourgogne-Franche-Comté': '27',
    'Bretagne': '53',
    'Centre-Val de Loire': '24',
    'Corse': '94',
    'Grand Est': '44',
    'Guadeloupe': '01',
    'Guyane': '03',
    'Hauts-De-France': '32',
    'Ile-de-France': '11',
    'La Réunion': '04',
    'Mayotte': '06',
    'Martinique': '02',
    'Normandie': '28',
    'Nouvelle Aquitaine': '75',
    'Occitanie': '76',
    'Pays de la Loire': '52',
    'Provence-Alpes-Côte d\'Azur': '93',
};

module.exports = name => {
    let codeRegion = mapper[name];
    if (!codeRegion) {
        throw new Error(`Region inconnue ${name}`);
    }
    return codeRegion;
};
