import { _get, _post } from './http-client';
import queryString from 'query-string';

const typeMapping = {
    'organisme': 'organismes-formateurs',
    'formation': 'formations',
    'action': 'actions',
    'session': 'sessions',
};

export const getScore = async (type, identifiant) => {

    let result = await _get(`/api/v1/${typeMapping[type]}/${identifiant}?${queryString.stringify({
        notes_decimales: true,
        fields: '-avis',
    })}`);

    return result.score;
};

export const getAvis = (type, identifiant, options) => {

    return _get(`/api/v1/${typeMapping[type]}/${identifiant}/avis?${queryString.stringify({
        notes_decimales: true,
        commentaires: true,
        page: options.page || 0,
        items_par_page: options.itemsParPage || 3,
    })}`);
};

export const saveContactStagiaire = data => {
    return _post(`/api/contact-stagiaires`, data);
};

