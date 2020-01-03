import { _get, _post, _put } from "../../../../common/utils/http-client";
import queryString from "query-string";
import { getToken } from "../../../utils/session";

export const searchOrganismes = (options = {}) => {
    return _get(`/backoffice/moderateur/organismes?${queryString.stringify(options)}`);
};

export const updateEditedCourriel = (id, courriel) => {
    return _put(`/backoffice/moderateur/organismes/${id}/updateEditedCourriel`, { courriel });
};

export const removeEditedCourriel = id => {
    return _put(`/backoffice/moderateur/organismes/${id}/removeEditedCourriel`);
};

export const resendEmailAccount = id => {
    return _post(`/backoffice/moderateur/organismes/${id}/resendEmailAccount`);
};

export const getExportAvisUrl = (options = {}) => {
    let publicUrl = process.env.PUBLIC_URL ? "" : "http://localhost:8080";
    let token = getToken();

    return `${publicUrl}/api/backoffice/moderateur/export/organismes.csv?${queryString.stringify({
        ...options,
        token
    })}`;
};
