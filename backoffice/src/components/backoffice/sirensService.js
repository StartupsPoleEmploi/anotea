import { _get } from '../../utils/http-client';

export const getSirens = () => {
    return _get(`/backoffice/organismes`);
};

export const getFormationsBySiren = siren => {
    return _get(`/backoffice/sirens/${siren}/formations`);
};

