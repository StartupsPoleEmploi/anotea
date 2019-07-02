const getCodePostaux = organisme => {

    let codePostaux = [];

    if (organisme.adresse) {
        codePostaux.push(organisme.adresse.code_postal);
    }

    if (organisme.lieux_de_formation) {
        codePostaux = [
            ...codePostaux,
            ...organisme.lieux_de_formation.map(lieu => lieu.adresse.code_postal)
        ];
    }

    if (organisme.organisme_formateurs) {
        codePostaux = [
            ...codePostaux,
            ...organisme.organisme_formateurs.reduce((acc, of) => {
                return [...acc, ...of.lieux_de_formation.map(lieu => lieu.adresse.code_postal)];
            }, [])];
    }

    return codePostaux;
};

module.exports = (regions, organisme) => {

    let region = getCodePostaux(organisme).reduce((acc, code) => {
        if (!acc) {
            try {
                return regions.findRegionByPostalCode(code);
            } catch (e) {
                return null;
            }
        } else {
            return acc;
        }
    }, null);

    if (!region) {
        throw new Error(`Unable to find region for organisme ${organisme.siret}`);
    }

    return region;
};


