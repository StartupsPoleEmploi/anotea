import { _put } from '../../../../utils/http-client';

export const updatePassword = (actualPassword, password, id, profile) => {
    return _put(`/backoffice/account/updatePassword`, {
        actualPassword,
        password,
        id,
        profile
    });
};
