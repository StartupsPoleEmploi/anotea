import { _get } from '../../common/utils/http-client';

export const getDepartements = () => {
    return _get(`/backoffice/departements`);
};


