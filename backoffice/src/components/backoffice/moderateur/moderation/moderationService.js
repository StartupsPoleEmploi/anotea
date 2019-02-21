import { _delete, _get, _put } from '../../../../utils/http-client';
import queryString from 'query-string';

export const searchAvis = (options = {}) => {
    return _get(`/backoffice/moderateur/avis?${queryString.stringify(options)}`);
};

export const maskPseudo = (id, mask) => {
    return _put(`/backoffice/moderateur/avis/${id}/pseudo`, { mask });
};

export const maskTitle = (id, mask) => {
    return _put(`/backoffice/moderateur/avis/${id}/title`, { mask });
};

export const rejectAvis = (id, reason) => {
    return _put(`/backoffice/moderateur/avis/${id}/reject`, { reason });
};

export const publishAvis = (id, qualification) => {
    return _put(`/backoffice/moderateur/avis/${id}/publish`, { qualification });
};

export const publishReponse = id => {
    return _put(`/backoffice/moderateur/avis/${id}/publishReponse`);
};

export const rejectReponse = id => {
    return _put(`/backoffice/moderateur/avis/${id}/rejectReponse`);
};

export const editAvis = (id, text) => {
    return _put(`/backoffice/moderateur/avis/${id}/edit`, { text });
};

export const resendEmail = id => {
    return _put(`/backoffice/moderateur/avis/${id}/resendEmail`);
};

export const deleteAvis = id => {
    return _delete(`/backoffice/moderateur/avis/${id}`);
};
