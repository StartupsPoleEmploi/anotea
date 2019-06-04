import { _get } from './http-client';
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

export const getAvis = (type, identifiant, page, itemsParPage) => {

    return _get(`/api/v1/${typeMapping[type]}/${identifiant}/avis?${queryString.stringify({
        notes_decimales: true,
        commentaires: true,
        page: page,
        items_par_page: itemsParPage,
    })}`);
};

