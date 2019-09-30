import { _get, _post } from '../../utils/http-client';

export const getAccount = token => {
    return _get(`/backoffice/accounts/${token}`);
};

export const activateAccount = (token, password) => {
    return _post(`/backoffice/accounts/${token}/activate`, { password });
};
