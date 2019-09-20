import { _get, _post } from '../../../../utils/http-client';

export const getActivationAccountStatus = activationToken => {
    return _get(`/backoffice/organisme/getActivationAccountStatus?token=${activationToken}`);
};

export const activateAccount = (token, password) => {
    return _post(`/backoffice/organisme/activateAccount`, { token, password });
};

export const getOrganisationInfo = id => {
    return _get(`/backoffice/organisme/${id}/info`);
};

export const loadAllAdvices = (id, filter, order, page) => {
    let query = `?filter=${filter}&order=${order}`;

    if (page !== null) {
        query += `&page=${page}`;
    }
    return _get(`/backoffice/organisme/${id}/allAdvices${query}`);
};

export const loadAllInventory = id => {
    return _get(`/backoffice/organisme/${id}/allInventory`);
};

export const getOrganisationTrainings = (id, postalCode) => {
    return _get(`/backoffice/organisme/${id}/trainings?postalCode=${postalCode}`);
};

export const getOrganisationTrainingSessions = (id, idTraining, postalCode) => {
    return _get(`/backoffice/organisme/${id}/training/${idTraining}/sessions?postalCode=${postalCode}`);
};

export const loadAdvices = (id, trainingId, postalCode, filter, order, page) => {
    let query = '';
    if (filter) {
        query += `&filter=${filter}&order=${order}`;
    }
    if (page !== null) {
        query += `&page=${page}`;
    }
    return _get(`/backoffice/organisme/${id}/advices?trainingId=${trainingId}&postalCode=${postalCode}${query}`);
};

export const loadInventory = (id, trainingId, postalCode) => {
    return _get(`/backoffice/organisme/${id}/advices/inventory?trainingId=${trainingId}&postalCode=${postalCode}`);
};

export const getOrganisationStates = id => {
    return _get(`/backoffice/organisme/${id}/states`);
};

export const getOrganisationLieuTrainingSessions = (siren, idTraining, postalCode) => {
    return _get(`/backoffice/organisme/organismes_formateurs/${siren}/training/${idTraining}/sessions?postalCode=${postalCode}`);
};
