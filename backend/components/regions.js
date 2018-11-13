let regions = [
    { codeINSEE: '1', codeRegion: '8', name: 'Guadeloupe' },
    { codeINSEE: '2', codeRegion: '13', name: 'Martinique' },
    { codeINSEE: '3', codeRegion: '9', name: 'Guyane' },
    { codeINSEE: '4', codeRegion: '12', name: 'La Réunion' },
    { codeINSEE: '6', codeRegion: '12', name: 'Mayotte' },
    { codeINSEE: '11', codeRegion: '11', name: 'Île-de-France' },
    { codeINSEE: '24', codeRegion: '5', name: 'Centre-Val de Loire' },
    { codeINSEE: '27', codeRegion: '3', name: 'Bourgogne-Franche-Comté' },
    { codeINSEE: '28', codeRegion: '14', name: 'Normandie' },
    { codeINSEE: '32', codeRegion: '10', name: 'Hauts-de-France' },
    { codeINSEE: '52', codeRegion: '17', name: 'Pays de la Loire' },
    { codeINSEE: '53', codeRegion: '4', name: 'Bretagne' },
    { codeINSEE: '75', codeRegion: '15', name: 'Nouvelle-Aquitaine' },
    { codeINSEE: '84', codeRegion: '2', name: 'Auvergne-Rhône-Alpes' },
    { codeINSEE: '93', codeRegion: '18', name: 'Provence-Alpes-Côte d\'Azur' },
    { codeINSEE: '94', codeRegion: '6', name: 'Corse' },
    { codeINSEE: '76', codeRegion: '16', name: 'Occitanie' },
    { codeINSEE: '44', codeRegion: '7', name: 'Grand-Est' },
];

module.exports = db => ({
    findCodeRegionByPostalCode: async postalCode => {
        let code = postalCode.substr(0, 2) !== '97' ? postalCode.substr(0, 2) : postalCode.substr(0, 3);

        let departement = await db.collection('departements').findOne({
            dept_num: `${parseInt(code, 10)}`,
        });

        if (!departement) {
            return Promise.reject(new Error(`Code region inconnu pour le departement ${departement}`));
        } else {
            return departement.region_num;
        }
    },
    findCodeRegionByName: async name => {

        let results = await db.collection('departements')
        .find({ $text: { $search: name } }, { score: { $meta: 'textScore' } })
        .project({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(1)
        .toArray();

        let region = results[0];
        if (!region) {
            let regionName = name.split(' ').join('-');
            return Promise.reject(new Error(`Nom de region inconnu: ${regionName}`));
        } else {
            return region.region_num;
        }
    },
    findRegionByCodeRegion: codeRegion => {
        let region = regions.find(r => r.codeRegion === codeRegion);
        return region ? region : Promise.reject(new Error(`Region inconnue pour le code INSEE: ${codeRegion}`));
    },
});
