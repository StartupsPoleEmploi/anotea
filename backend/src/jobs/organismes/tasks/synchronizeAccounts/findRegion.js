module.exports = (regions, organisme) => {

    const findRegion = codePostal => {
        try {
            return regions.findRegionByPostalCode(codePostal);
        } catch (e) {
            return null;
        }
    };

    let region = null;

    if (organisme.adresse) {
        region = findRegion(organisme.adresse.code_postal);
    }

    if (!region && organisme.lieux_de_formation) {
        region = organisme.lieux_de_formation.find(lieu => findRegion(lieu.adresse.code_postal));
    }

    if (!region && organisme.organisme_formateurs) {
        region = organisme.organisme_formateurs.find(of => {
            return of.lieux_de_formation.find(lieu => findRegion(lieu.adresse.code_postal));
        });
    }

    return region;
};


