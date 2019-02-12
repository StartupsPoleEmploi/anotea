import { _delete, _get, _put } from '../utils/http-client';
import queryString from 'query-string';

export const searchAvis = (options = {}) => {
    return _get(`/backoffice/avis?${queryString.stringify(options)}`);
};

export const searchAvisWithReponse = (options = {}) => {
    return _get(`/backoffice/avisWithReponse?${queryString.stringify(options)}`);
};

export const maskPseudo = (id, mask) => {
    return _put(`/backoffice/avis/${id}/pseudo`, { mask });
};

export const maskTitle = (id, mask) => {
    return _put(`/backoffice/avis/${id}/title`, { mask });
};

export const rejectAvis = (id, reason) => {
    return _put(`/backoffice/avis/${id}/reject`, { reason });
};

export const markAvisAsRead = (id, userId) => {
    return _put(`/backoffice/avis/${id}/markAsRead?userID=${userId}`);
};

export const markAvisAsNotRead = (id, userId) => {
    return _put(`/backoffice/avis/${id}/markAsNotRead?userID=${userId}`);
};

export const reportAvis = (id, userId) => {
    return _put(`/backoffice/avis/${id}/report?userID=${userId}`);
};

export const unreportAvis = (id, userId) => {
    return _put(`/backoffice/avis/${id}/unreport?userID=${userId}`);
};

export const publishAvis = (id, qualification) => {
    return _put(`/backoffice/avis/${id}/publish`, { qualification });
};

export const publishReponse = id => {
    return _put(`/backoffice/avis/${id}/publishReponse`);
};

export const rejectReponse = id => {
    return _put(`/backoffice/avis/${id}/rejectReponse`);
};

export const answerAvis = (id, answer) => {
    return _put(`/backoffice/avis/${id}/reponse`, { answer });
};

export const removeAvisAnswer = id => {
    return _delete(`/backoffice/avis/${id}/reponse`);
};

export const editAvis = (id, text) => {
    return _put(`/backoffice/avis/${id}/edit`, { text });
};

export const resendEmail = id => {
    return _put(`/backoffice/avis/${id}/resendEmail`);
};

export const deleteAvis = id => {
    return _delete(`/backoffice/avis/${id}`);
};
