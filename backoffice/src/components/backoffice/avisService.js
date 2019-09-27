import { _delete, _get, _put } from '../../utils/http-client';
import queryString from 'query-string';
import { getToken } from '../../utils/session';

export const searchAvis = (params = {}) => {
    return _get(`/backoffice/avis?${queryString.stringify(params)}`);
};

export const getExportAvisUrl = (options = {}) => {
    let publicUrl = process.env.PUBLIC_URL ? '' : 'http://localhost:8080';
    let token = getToken();

    return `${publicUrl}/api/backoffice/avis.csv?${queryString.stringify({ ...options, token })}`;
};

export const getStats = (options = {}) => {
    return _get(`/backoffice/avis/stats?${queryString.stringify(options)}`);
};

export const getModerationStats = params => {
    return _get(`/backoffice/avis/moderationStats?${queryString.stringify(params)}`);
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

