import { _put, _get, _post } from '../../../../utils/http-client';
import queryString from 'query-string';

export const searchOrganismes = (options = {}) => {
    return _get(`/backoffice/moderateur/organismes?${queryString.stringify(options)}`);
};

export const updateEditedCourriel = (id, courriel) => {
    return _put(`/backoffice/moderateur/organismes/${id}/updateEditedCourriel`, { courriel });
};

export const removeEditedCourriel = id => {
    return _put(`/backoffice/moderateur/organismes/${id}/removeEditedCourriel`);
};

export const resendEmailAccount = id => {
    return _post(`/backoffice/moderateur/organismes/${id}/resendEmailAccount`);
};

export const exportOrganismes = (status) => {
    return _get(`/backoffice/moderateur/organismes/export/${status}`);
};
