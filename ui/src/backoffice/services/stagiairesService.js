import { _get } from '../../common/utils/http-client';
import queryString from 'query-string';

export const getStagiairesStats = (options = {}) => {
    return _get(`/backoffice/stagiaires/stats?${queryString.stringify(options)}`);
};

