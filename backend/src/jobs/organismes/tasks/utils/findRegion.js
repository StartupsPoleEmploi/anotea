const flatten = array => [].concat.apply([], array);

module.exports = (regions, data) => {
    let error = null;
    let lieuxDeFormation = data.lieux_de_formation;

    if (data.organisme_formateurs) { //organisme responsable
        try {
            return regions.findRegionByPostalCode(data.adresse.code_postal);
        } catch (e) {
            lieuxDeFormation = flatten(data.organisme_formateurs.map(o => o.lieux_de_formation));
            error = e;
        }
    }

    let region = lieuxDeFormation.reduce((acc, lieu) => {
        if (!acc) {
            try {
                acc = regions.findRegionByPostalCode(lieu.adresse.code_postal);
            } catch (e) {
                error = e;
            }
        }
        return acc;
    }, null);

    if (!region) {
        throw error;
    }

    return region;
};


