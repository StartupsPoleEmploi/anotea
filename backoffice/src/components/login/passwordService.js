import { _get, _put } from '../../utils/http-client';

export const askNewPassword = identifiant => _put(`/backoffice/askNewPassword`, { identifiant });

export const checkIfPasswordTokenExists = token => {
    return _get(`/backoffice/checkIfPasswordTokenExists?token=${token}`);
};

export const updatePassword = (password, token) => {
    return _put(`/backoffice/updatePassword`, {
        password,
        token,
    });
};
