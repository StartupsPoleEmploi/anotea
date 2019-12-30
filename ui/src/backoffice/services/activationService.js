import { _get, _post } from '../../common/utils/http-client';

export const getActivationStatus = token => {
    return _get(`/backoffice/activation/${token}`);
};

export const activate = (token, password) => {
    return _post(`/backoffice/activation/${token}`, { password });
};
