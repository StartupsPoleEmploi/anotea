import { _delete, _get, _put } from '../../common/utils/http-client';
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

export const maskTitle = (id, mask) => {
    return _put(`/backoffice/avis/${id}/title`, { mask });
};

export const rejectAvis = (id, qualification) => {
    return _put(`/backoffice/avis/${id}/reject`, { qualification });
};

export const validateAvis = (id, qualification) => {
    return _put(`/backoffice/avis/${id}/validate`, { qualification });
};

export const validateReponse = id => {
    return _put(`/backoffice/avis/${id}/validateReponse`);
};

export const rejectReponse = id => {
    return _put(`/backoffice/avis/${id}/rejectReponse`);
};

export const editAvis = (id, text) => {
    return _put(`/backoffice/avis/${id}/edit`, { text });
};

export const deleteAvis = (id, params = { sendEmail: false }) => {
    return _delete(`/backoffice/avis/${id}?${queryString.stringify(params)}`);
};

export const addReponse = (id, text) => {
    return _put(`/backoffice/avis/${id}/addReponse`, { text });
};

export const removeReponse = id => {
    return _put(`/backoffice/avis/${id}/removeReponse`);
};

export const markAvisAsRead = (id, read) => {
    return _put(`/backoffice/avis/${id}/read`, { read });
};

export const reportAvis = (id, report, commentReport) => {
    return _put(`/backoffice/avis/${id}/report`, { report, commentReport });
};

export const getAvisStats = (options = {}) => {
    return _get(`/backoffice/avis/stats?${queryString.stringify(options)}`);
};
