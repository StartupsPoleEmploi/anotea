import { _get } from '../../common/utils/http-client';

export const getFinanceurs = () => {
    return _get(`/backoffice/financeurs`);
};


