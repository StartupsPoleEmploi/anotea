import { _get } from '../../utils/http-client';

export const getOrganismes = () => {
    return _get(`/backoffice/organismes`);
};

export const getFormations = siren => {
    return _get(`/backoffice/organismes/${siren}/formations`);
};

