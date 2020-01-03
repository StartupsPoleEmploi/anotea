import { _get, _put } from "../../common/utils/http-client";

export const askNewPassword = identifiant => {
    return _put(`/backoffice/askNewPassword`, { identifiant });
};

export const checkIfPasswordTokenExists = token => {
    return _get(`/backoffice/checkIfPasswordTokenExists?token=${token}`);
};

export const resetPassword = (password, forgottenPasswordToken) => {
    return _put(`/backoffice/resetPassword`, { password, token: forgottenPasswordToken });
};
