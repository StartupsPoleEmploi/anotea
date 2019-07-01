let mapper = {
    'Auvergne-Rhône-Alpes': '2',
    'Bourgogne-Franche-Comté': '3',
    'Bretagne': '4',
    'Centre-Val de Loire': '5',
    'Corse': '6',
    'Grand Est': '7',
    'Guadeloupe': '8',
    'Guyane': '9',
    'Hauts-De-France': '10',
    'Ile-de-France': '11',
    'La Réunion': '12',
    'Martinique': '13',
    'Normandie': '14',
    'Nouvelle Aquitaine': '15',
    'Occitanie': '16',
    'Pays de la Loire': '17',
    'Provence-Alpes-Côte d\'Azur': '18',
}
module.exports = name => {
    let codeRegion = mapper[name];
    if (!codeRegion) {
        throw new Error(`Region inconnue ${name}`);
    }
    return codeRegion;
};
