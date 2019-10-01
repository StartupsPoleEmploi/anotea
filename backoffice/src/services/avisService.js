import { _delete, _get, _put } from '../utils/http-client';
import queryString from 'query-string';
import { getToken } from '../utils/session';

export const searchAvis = (params = {}) => {
    return _get(`/backoffice/avis?${queryString.stringify(params)}`);
};

export const getExportAvisUrl = (options = {}) => {
    let publicUrl = process.env.PUBLIC_URL ? '' : 'http://localhost:8080';
    let token = getToken();

    return `${publicUrl}/api/backoffice/avis.csv?${queryString.stringify({ ...options, token })}`;
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

export const publishAvis = (id, qualification) => {
    return _put(`/backoffice/avis/${id}/publish`, { qualification });
};

export const publishReponse = id => {
    return _put(`/backoffice/avis/${id}/publishReponse`);
};

export const rejectReponse = id => {
    return _put(`/backoffice/avis/${id}/rejectReponse`);
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

