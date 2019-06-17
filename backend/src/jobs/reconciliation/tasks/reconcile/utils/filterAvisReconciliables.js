const _ = require('lodash');

module.exports = (action, comments) => {
    let all = comments.filter(a => {
        return a.training.place.postalCode === action.lieu_de_formation.coordonnees.adresse.codepostal &&
            a.training.organisation.siret === action.organisme_formateur.siret_formateur.siret;
    });

    let certifiants = all.filter(c => !_.isEmpty(c.training.certifInfo.id));

    return certifiants.length > 0 ? certifiants : all;
};
