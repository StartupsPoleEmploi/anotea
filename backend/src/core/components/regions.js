const _ = require("lodash");
const regions = require("../../../config/regions.json");

module.exports = () => ({
    findRegionByPostalCode: postalCode => {
        let code = postalCode.substr(0, 2) !== "97" ? postalCode.substr(0, 2) : postalCode.substr(0, 3);

        let region = regions.find(region => region.departements.find(departement => departement.code === code));

        if (!region) {
            throw new Error(`Code region inconnu pour le departement ${code}`);
        }
        return region;

    },
    getRegions: () => regions,
    findActiveRegions: feature => {
        return regions
        .filter(region => region.active === true)
        .filter(region => !feature || _.get(region, feature) === true);
    },
    findRegionByCodeRegion: codeRegion => {
        let region = regions.find(region => region.codeRegion === codeRegion);
        if (!region) {
            throw new Error(`Region inconnue pour le code region: ${codeRegion}`);
        }
        return region;
    },
    findRegionByCodeINSEE: codeINSEE => {

        if (codeINSEE === "06") {
            //Mayotte et La Réunion ont le même codeRegion PE
            codeINSEE = "04";
        }

        let region = regions.find(region => region.codeINSEE === codeINSEE);
        if (!region) {
            throw new Error(`Region inconnue pour le code INSEE: ${codeINSEE}`);
        }
        return region;
    },
});
