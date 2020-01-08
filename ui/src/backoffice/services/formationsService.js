import { _get } from '../../common/utils/http-client';
import queryString from 'query-string';

export const getFormations = (options = {}) => {
    return _get(`/backoffice/formations?${queryString.stringify(options)}`);
};

