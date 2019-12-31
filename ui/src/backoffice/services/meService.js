import { _put } from '../../common/utils/http-client';

export const updatePassword = (current, password) => {
    return _put(`/backoffice/me/updatePassword`, {
        current,
        password,
    });
};
