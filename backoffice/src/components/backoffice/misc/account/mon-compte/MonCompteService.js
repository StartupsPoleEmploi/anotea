import { _put } from '../../../../../utils/http-client';

export const updatePassword = (actualPassword, password, id, profile) => {
    return _put(`/backoffice/accounts/me/updatePassword`, {
        actualPassword,
        password,
        id,
        profile
    });
};
