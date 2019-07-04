const _ = require('lodash');

const normalize = str => {
    return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, '')
    .replace(/ /g, '')
    .toLowerCase();
};

const sameLieuDeFormation = (action, comment, options) => {

    let commentPostalCode = comment.training.place.postalCode;
    let actionCodePostal = action.lieu_de_formation.coordonnees.adresse.codepostal;

    if (commentPostalCode === actionCodePostal) {
        return true;
    } else if (!/^75|690|130/.test(commentPostalCode)) {
        let match = commentPostalCode.substring(0, 2) === actionCodePostal.substring(0, 2) &&
            normalize(comment.training.place.city) === normalize(action.lieu_de_formation.coordonnees.adresse.ville);

        if (match && options.reporter) {
            options.reporter.ville({
                codeRegion: comment.codeRegion,
                c1: commentPostalCode,
                c2: actionCodePostal,
                v1: comment.training.place.city,
                v2: action.lieu_de_formation.coordonnees.adresse.ville,
            });
        }

        return match;
    }

    return false;
};

const sameSiren = (action, comment) => {
    return action.organisme_formateur.siret_formateur.siret.substring(0, 9) ===
        comment.training.organisation.siret.substring(0, 9);
};

module.exports = (action, comments, options) => {

    let all = comments.filter(comment => sameSiren(action, comment) && sameLieuDeFormation(action, comment, options));
    let certifiants = all.filter(comment => !_.isEmpty(comment.training.certifInfo.id));

    return certifiants.length > 0 ? certifiants : all;
};
