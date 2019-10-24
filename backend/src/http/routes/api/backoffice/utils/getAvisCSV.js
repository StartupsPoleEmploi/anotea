const _ = require('lodash');
const moment = require('moment');

let sanitizeNote = note => `${note}`.replace(/\./g, ',');
let sanitizeString = note => `${note}`.replace(/;/g, '').replace(/"/g, '').replace(/\r/g, ' ').replace(/\n/g, ' ').trim();

let getStatus = comment => {
    if (comment.status === 'archived') {
        return 'Archivé';
    } else if (comment.status === 'validated') {
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

module.exports = () => {
    return {
        'id': comment => comment._id,
        'note accueil': comment => sanitizeNote(comment.rates.accueil),
        'note contenu formation': comment => sanitizeNote(comment.rates.contenu_formation),
        'note equipe formateurs': comment => sanitizeNote(comment.rates.equipe_formateurs),
        'note matériel': comment => sanitizeNote(comment.rates.moyen_materiel),
        'note accompagnement': comment => sanitizeNote(comment.rates.accompagnement),
        'note global': comment => sanitizeNote(comment.rates.global),
        'titre': comment => sanitizeString(_.get(comment, 'comment.title', '')),
        'commentaire': comment => sanitizeString(_.get(comment, 'comment.text', '')),
        'qualification': comment => _.isEmpty(comment.qualification) ? '' : comment.qualification,
        'statut': comment => getStatus(comment),
        'réponse': comment => sanitizeString(_.get(comment, 'reponse.text', '')),
        'réponse statut': comment => comment.reponse ? getReponseStatus(comment.reponse.status) : '',
        'id formation': comment => comment.training.idFormation,
        'titre formation': comment => comment.training.title,
        'date début': comment => moment(comment.training.startDate).format('DD/MM/YYYY'),
        'date de fin prévue': comment => moment(comment.training.scheduledEndDate).format('DD/MM/YYYY'),
        'siret organisme': comment => comment.training.organisation.siret,
        'libellé organisme': comment => comment.training.organisation.label,
        'nom organisme': comment => comment.training.organisation.name,
        'code postal': comment => comment.training.place.postalCode,
        'ville': comment => comment.training.place.city,
        'id certif info': comment => comment.training.certifInfo.id,
        'libellé certifInfo': comment => comment.training.certifInfo.label,
        'id session': comment => comment.training.idSession,
        'formacode': comment => comment.training.formacode,
        'AES reçu': comment => comment.training.aesRecu,
        'code financeur': comment => comment.training.codeFinanceur,
    };
};
