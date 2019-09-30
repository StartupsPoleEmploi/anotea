import { _get } from '../../utils/http-client';
import queryString from 'query-string';

export const getFormations = (options = {}) => {
    return _get(`/backoffice/formations?${queryString.stringify(options)}`);
};

