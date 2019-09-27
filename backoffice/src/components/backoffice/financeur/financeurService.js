import queryString from 'query-string';
import { _get } from '../../../utils/http-client';

export const getOrganismes = () => {
    return _get(`/backoffice/financeur/organismes`);
};

export const getFormations = siren => {
    return _get(`/backoffice/financeur/organismes/${siren}/formations`);
};

export const getStats = (options = {}) => {
    return _get(`/backoffice/financeur/stats?${queryString.stringify(options)}`);
};
