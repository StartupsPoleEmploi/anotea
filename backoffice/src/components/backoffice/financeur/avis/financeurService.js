import { _get } from '../../../../utils/http-client';
import queryString from 'query-string';

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
