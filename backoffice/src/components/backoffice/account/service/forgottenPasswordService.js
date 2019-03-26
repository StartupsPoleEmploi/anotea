import { _get, _put } from '../../../../utils/http-client';

export const askNewPassword = username => {
    return _put(`/backoffice/askNewPassword`, {
        username: username
    });
};

export const checkIfPasswordTokenExists = token => {
    return _get(`/backoffice/checkIfPasswordTokenExists?token=${token}`);
};

export const updatePassword = (token, password) => {
    return _put(`/backoffice/updatePassword`, {
        token,
        password
    });
};
