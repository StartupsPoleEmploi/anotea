const _ = require('lodash');
const moment = require('moment');

let sanitizeNote = note => `${note}`.replace(/\./g, ',');
let sanitizeString = note => `${note}`.replace(/;/g, '').replace(/"/g, '').replace(/\r/g, ' ').replace(/\n/g, ' ').trim();

let getStatus = avis => {
    if (avis.status === 'archived') {
        return 'Archivé';
    } else if (avis.status === 'validated') {
        return 'Validé';
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

module.exports = profile => {
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
        ...(profile === 'organisme' ? {} : { 'qualification': avis => getQualification(avis) }),
        'statut': avis => getStatus(avis),
        'réponse': avis => sanitizeString(_.get(avis, 'reponse.text', '')),
        'réponse statut': avis => avis.reponse ? getReponseStatus(avis.reponse.status) : '',
        'id formation': avis => avis.training.idFormation,
        'titre formation': avis => avis.training.title,
        'date début': avis => moment(avis.training.startDate).format('DD/MM/YYYY'),
        'date de fin prévue': avis => moment(avis.training.scheduledEndDate).format('DD/MM/YYYY'),
        'siret organisme': avis => avis.training.organisation.siret,
        'libellé organisme': avis => avis.training.organisation.label,
        'nom organisme': avis => avis.training.organisation.name,
        'code postal': avis => avis.training.place.postalCode,
        'ville': avis => avis.training.place.city,
        'certifInfos': avis => avis.training.certifInfos.join(','),
        'formacodes': avis => avis.training.formacodes.join(','),
        'id session': avis => avis.training.idSession,
        'AES reçu': avis => avis.training.aesRecu,
        'code financeur': avis => avis.training.codeFinanceur,
    };
};
