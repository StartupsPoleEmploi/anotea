const _ = require('lodash');

module.exports = (db, configuration) => ({
    findCodeRegionByPostalCode: async postalCode => {

        let code = postalCode.substr(0, 2) !== '97' ? postalCode.substr(0, 2) : postalCode.substr(0, 3);

        let region = configuration.regions.find(region => region.departements.find(dep => dep === code));

        if (!region) {
            return Promise.reject(new Error(`Code region inconnu pour le departement ${code}`));
        } else {
            return region.codeRegion;
        }
    },
    findCodeRegionByName: async name => {

        let results = await db.collection('regions')
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
            return region.codeRegion;
        }
    },
    findActiveRegions: feature => {
        return configuration.regions
        .filter(region => region.active === true)
        .filter(region => !feature || _.get(region, feature) === true);
    },
    findRegionByCodeRegion: async codeRegion => {
        let region = configuration.regions.find(region => region.codeRegion === codeRegion);
        return region ? region : Promise.reject(new Error(`Region inconnue pour le code region: ${codeRegion}`));
    },
});
