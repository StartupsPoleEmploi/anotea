import queryString from 'query-string';
import { _get } from '../../utils/http-client';
import { getToken } from '../../utils/session';

export const searchAvis = (options = {}) => {
    return _get(`/backoffice/avis?${queryString.stringify(options)}`);
};

export const getExportAvisUrl = (options = {}) => {
    let publicUrl = process.env.PUBLIC_URL ? '' : 'http://localhost:8080';
    let token = getToken();

    return `${publicUrl}/api/backoffice/avis.csv?${queryString.stringify({ ...options, token })}`;
};

export const getStats = () => {
    return _get(`/backoffice/avis/stats`);
};
