const _ = require('lodash');
const asSiren = require('./asSiren');

module.exports = (action, comments) => {
    let all = comments.filter(c => {
        return c.training.place.postalCode === action.lieu_de_formation.coordonnees.adresse.codepostal &&
            asSiren(c.training.organisation.siret) === asSiren(action.organisme_formateur.siret_formateur.siret);
    });

    let certifiants = all.filter(c => !_.isEmpty(c.training.certifInfo.id));

    return certifiants.length > 0 ? certifiants : all;
};
