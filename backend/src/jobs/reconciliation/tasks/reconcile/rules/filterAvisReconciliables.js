const _ = require('lodash');

module.exports = (action, comments) => {
    let all = comments.filter(c => {

        let siren = action.organisme_formateur.siret_formateur.siret.substring(0, 9);

        return c.training.place.postalCode === action.lieu_de_formation.coordonnees.adresse.codepostal &&
            new RegExp(`^${siren}`).test(c.training.organisation.siret);
    });

    let certifiants = all.filter(c => !_.isEmpty(c.training.certifInfo.id));

    return certifiants.length > 0 ? certifiants : all;
};
