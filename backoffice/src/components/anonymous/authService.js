import { _get, _post, _put } from '../../utils/http-client';

export const login = (identifiant, password) => _post('/backoffice/login', { identifiant, password });

export const loginWithAccessToken = (accessToken, origin) => {
    return _get(`/backoffice/login?origin=${origin}&access_token=${accessToken}`);
};

export const askNewPassword = identifiant => {
    return _put(`/backoffice/askNewPassword`, { identifiant });
};

export const checkIfPasswordTokenExists = token => {
    return _get(`/backoffice/checkIfPasswordTokenExists?token=${token}`);
};

export const resetPassword = (password, forgottenPasswordToken) => {
    return _put(`/backoffice/resetPassword`, { password, token: forgottenPasswordToken });
};

export const getAccount = token => {
    return _get(`/backoffice/accounts/${token}`);
};

export const activateAccount = (token, password) => {
    return _post(`/backoffice/accounts/${token}/activate`, { password });
};

export const updatePassword = (current, password) => {
    return _put(`/backoffice/accounts/me/updatePassword`, { current, password });
};
