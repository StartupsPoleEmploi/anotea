import { _put } from '../../utils/http-client';

export const updatePassword = (actualPassword, password) => {
    return _put(`/backoffice/me/updatePassword`, {
        actualPassword,
        password,
    });
};
