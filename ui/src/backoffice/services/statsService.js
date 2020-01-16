import { _get } from '../../common/utils/http-client';
import queryString from 'query-string';

export const getStagiairesStats = (options = {}) => {
    return _get(`/backoffice/stats/stagiaires?${queryString.stringify(options)}`);
};

export const getAvisStats = (options = {}) => {
    return _get(`/backoffice/stats/avis?${queryString.stringify(options)}`);
};

export const getPublicStatistics = (options = {}) => {
    return _get(`/stats?${queryString.stringify(options)}`);
};
