const _ = require('lodash');
const moment = require('moment');
const { isPoleEmploi } = require('../../../../core/utils/financeurs');

let sanitizeNote = note => `${note}`.replace(/\./g, ',');
let sanitizeString = note => `${note}`.replace(/;/g, '').replace(/"/g, '').replace(/\r/g, ' ').replace(/\n/g, ' ').trim();

let getStatus = avis => {
    if (avis.status === 'archived') {
        return 'Archivé';
    } else if (avis.status === 'validated') {
        return 'Validé';
    } else if (avis.status === 'rejected') {
        return 'Rejeté';
    } else {
        return 'En cours de modération';
    }
};

let getReponseStatus = reponse => {
    switch (reponse.status) {
        case 'rejected':
            return 'Rejetée';
        case 'validated':
            return 'Validée';
        default:
            return 'En cours de modération';
    }
};

let getQualification = avis => {
    return _.isEmpty(avis.qualification) ? '' : avis.qualification;
};

module.exports = user => {
    return {
        'id': avis => avis._id,
        'note accueil': avis => sanitizeNote(avis.notes.accueil),
        'note contenu formation': avis => sanitizeNote(avis.notes.contenu_formation),
        'note equipe formateurs': avis => sanitizeNote(avis.notes.equipe_formateurs),
        'note matériel': avis => sanitizeNote(avis.notes.moyen_materiel),
        'note accompagnement': avis => sanitizeNote(avis.notes.accompagnement),
        'note global': avis => sanitizeNote(avis.notes.global),
        'titre': avis => sanitizeString(_.get(avis, 'commentaire.title', '')),
        'commentaire': avis => sanitizeString(_.get(avis, 'commentaire.text', '')),
        ...(user.profile === 'organisme' ? {} : { 'qualification': avis => getQualification(avis) }),
        'statut': avis => getStatus(avis),
        'réponse': avis => sanitizeString(_.get(avis, 'reponse.text', '')),
        'réponse statut': avis => avis.reponse ? getReponseStatus(avis.reponse) : '',
        'id formation': avis => avis.formation.numero,
        'titre formation': avis => avis.formation.intitule,
        'date début': avis => moment(avis.formation.action.session.periode.debut).format('DD/MM/YYYY'),
        'date de fin prévue': avis => moment(avis.formation.action.session.periode.fin).format('DD/MM/YYYY'),
        'siret organisme': avis => avis.formation.action.organisme_formateur.siret,
        'libellé organisme': avis => avis.formation.action.organisme_formateur.label,
        'nom organisme': avis => avis.formation.action.organisme_formateur.raison_sociale,
        'code postal': avis => avis.formation.action.lieu_de_formation.code_postal,
        'ville': avis => avis.formation.action.lieu_de_formation.ville,
        'certifInfos': avis => avis.formation.certifications.map(c => c.certif_info).join(','),
        'formacodes': avis => avis.formation.domaine_formation.formacodes.join(','),
        'id session': avis => avis.formation.action.session.id,
        'code financeur': avis => avis.formation.action.organisme_financeurs.map(o => o.code_financeur).join(','),
        ...(isPoleEmploi(user.codeFinanceur) ? { 'dispositif de financement': avis => avis.dispositifFinancement } : {}),
    };
};
