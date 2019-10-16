import { _get } from '../utils/http-client';

export const getDepartements = () => {
    return _get(`/backoffice/departements`);
};


