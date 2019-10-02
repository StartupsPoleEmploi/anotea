import { _get } from '../utils/http-client';
import queryString from 'query-string';

export const getStagiairesStats = (options = {}) => {
    return _get(`/backoffice/stats/stagiaires?${queryString.stringify(options)}`);
};

export const getAvisStats = (options = {}) => {
    return _get(`/backoffice/stats/avis?${queryString.stringify(options)}`);
};

export const getModerationStats = (options = {}) => {
    return _get(`/backoffice/stats/moderation?${queryString.stringify(options)}`);
};
