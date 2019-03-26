import { _put } from '../../../../utils/http-client';

export const addReponse = (id, text) => {
    return _put(`/backoffice/organisme/avis/${id}/addReponse`, { text });
};

export const removeReponse = id => {
    return _put(`/backoffice/organisme/avis/${id}/removeReponse`);
};

export const markAvisAsRead = (id, userId) => {
    return _put(`/backoffice/organisme/avis/${id}/markAsRead?userID=${userId}`);
};

export const markAvisAsNotRead = (id, userId) => {
    return _put(`/backoffice/organisme/avis/${id}/markAsNotRead?userID=${userId}`);
};

export const reportAvis = (id, userId) => {
    return _put(`/backoffice/organisme/avis/${id}/report?userID=${userId}`);
};

export const unreportAvis = (id, userId) => {
    return _put(`/backoffice/organisme/avis/${id}/unreport?userID=${userId}`);
};
