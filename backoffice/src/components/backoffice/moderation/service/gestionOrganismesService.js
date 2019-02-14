import { _delete, _post } from '../../../../utils/http-client';

export const updateEditedCourriel = (id, email) => {
    return _post(`/backoffice/moderateur/organismes/${id}/editedCourriel`, { email: email });
};

export const deleteEditedCourriel = (id, email) => {
    return _delete(`/backoffice/moderateur/organismes/${id}/editedCourriel`, { email: email });
};

export const resendEmailAccount = id => {
    return _post(`/backoffice/moderateur/organismes/${id}/resendEmailAccount`);
};
