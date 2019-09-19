import queryString from 'query-string';
import { _get } from '../../../utils/http-client';
import { getToken } from '../../../utils/token';

export const getDepartements = () => {
    return _get(`/backoffice/financeur/departements`);
};

export const getOrganismes = () => {
    return _get(`/backoffice/financeur/organismes`);
};

export const getFormations = siren => {
    return _get(`/backoffice/financeur/organismes/${siren}/formations`);
};

export const searchAvis = (options = {}) => {
    return _get(`/backoffice/financeur/avis?${queryString.stringify(options)}`);
};

export const getStats = (options = {}) => {
    return _get(`/backoffice/financeur/stats?${queryString.stringify(options)}`);
};

export const getExportAvisUrl = (options = {}) => {
    let publicUrl = process.env.PUBLIC_URL ? '' : 'http://localhost:8080';
    let token = getToken();

    return `${publicUrl}/api/backoffice/financeur/avis.csv?${queryString.stringify({ ...options, token })}`;
};
