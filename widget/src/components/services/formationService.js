import { _get } from '../../utils/http-client';

let emulatePaginatedAvisList = doc => {
    let avis = doc.avis.filter(avis => avis.commentaire);
    return {
        score: doc.score,
        results: {
            avis,
            meta: {
                pagination: {
                    page: 0,
                    items_par_page: avis.length,
                    total_items: avis.length,
                    total_pages: 1,
                }
            }
        },
    };
};

export const getFormation = async id => {
    let formation = await _get(`/api/v1/formations/${id}?notes_decimales=true`);
    return emulatePaginatedAvisList(formation);
};

export const getAction = async id => {
    let action = await _get(`/api/v1/actions/${id}?notes_decimales=true`);
    return emulatePaginatedAvisList(action);
};

export const getSession = async id => {
    let session = await _get(`/api/v1/sessions/${id}?notes_decimales=true`);
    return emulatePaginatedAvisList(session);
};

