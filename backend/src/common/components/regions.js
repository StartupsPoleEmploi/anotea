const _ = require('lodash');

module.exports = configuration => ({
    findRegionByPostalCode: postalCode => {
        let code = postalCode.substr(0, 2) !== '97' ? postalCode.substr(0, 2) : postalCode.substr(0, 3);

        let region = configuration.regions.find(region => region.departements.find(dep => dep === code));

        if (!region) {
            throw new Error(`Code region inconnu pour le departement ${code}`);
        }
        return region;

    },
    findActiveRegions: feature => {
        return configuration.regions
        .filter(region => region.active === true)
        .filter(region => !feature || _.get(region, feature) === true);
    },
    findRegionByCodeRegion: codeRegion => {
        let region = configuration.regions.find(region => region.codeRegion === codeRegion);
        if (!region) {
            throw new Error(`Region inconnue pour le code region: ${codeRegion}`);
        }
        return region;
    },
    findRegionByCodeINSEE: codeINSEE => {
        let region = configuration.regions.find(region => region.codeINSEE === codeINSEE);
        if (!region) {
            throw new Error(`Region inconnue pour le code INSEE: ${codeINSEE}`);
        }
        return region;
    },
});
