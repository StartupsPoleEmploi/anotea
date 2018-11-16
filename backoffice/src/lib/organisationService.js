import { _get, _post } from '../utils/http-client';

export const getActivationAccountStatus = activationToken => {
    return _get(`/backoffice/organisation/getActivationAccountStatus?token=${activationToken}`);
};

export const activateAccount = (token, password) => {
    return _post(`/backoffice/organisation/activateAccount`, { token, password });
};

export const getOrganisationInfo = id => {
    return _get(`/backoffice/organisation/${id}/info`);
};

export const loadAllAdvices = (id, filter, order, page) => {
    let query = `?filter=${filter}&order=${order}`;

    if (page != null) {
        query += `&page=${page}`;
    }
    return _get(`/backoffice/organisation/${id}/allAdvices${query}`);
};

export const loadAllInventory = id => {
    return _get(`/backoffice/organisation/${id}/allInventory`);
};

export const getOrganisationTrainings = (id, postalCode) => {
    return _get(`/backoffice/organisation/${id}/trainings?postalCode=${postalCode}`);
};

export const getOrganisationTrainingSessions = (id, idTraining, postalCode) => {
    return _get(`/backoffice/organisation/${id}/training/${idTraining}/sessions?postalCode=${postalCode}`);
};

export const loadAdvices = (id, trainingId, postalCode, filter, order, page) => {
    let query = '';
    if (filter) {
        query += `&filter=${filter}&order=${order}`;
    }
    if (page != null) {
        query += `&page=${page}`;
    }
    return _get(`/backoffice/organisation/${id}/advices?trainingId=${trainingId}&postalCode=${postalCode}${query}`);
};

export const loadInventory = (id, trainingId, postalCode) => {
    return _get(`/backoffice/organisation/${id}/advices/inventory?trainingId=${trainingId}&postalCode=${postalCode}`);
};

export const getOrganisationStates = id => {
    return _get(`/backoffice/organisation/${id}/states`);
};

export const updateEditedEmail = (id, email) => {
    return _post(`/backoffice/organisation/${id}/editedEmail`, { email: email });
};

export const deleteEditedEmail = (id, email) => {
    return _get(`/backoffice/organisation/${id}/editedEmail/delete`, { email: email });
};

export const resendEmailAccount = id => {
    return _post(`/backoffice/organisation/${id}/resendEmailAccount`);
};