import { _get } from '../../../../utils/http-client';

export const getRegions = () => {
    
    return _get(`/regions`);
};

export const getOrganisations = (idregion, codeFinanceur) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idregion}/organisations${query}`);
};

export const getAdvices = (idRegion, codeFinanceur, filter, order, page) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (filter) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}filter=${filter}&order=${order}`;
    }
    if (page != null) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}page=${page}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/advices${query}`);
};

export const loadInventoryForAllAdvicesWhenFinancerFirstConnexion = (idRegion, codeFinanceur) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/inventory${query}`);
};

export const getOrganisationPlaces = (idRegion, codeFinanceur, siren) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/organisation/${siren}/places${query}`);
};

export const getOrganisationLieuTrainings = (idRegion, codeFinanceur, siren, postalCode) => {
    let query = '';
    if (codeFinanceur) {
        query = `&codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/organisme_formateur/${siren}/trainings?postalCode=${postalCode}${query}`);
};

export const getOrganisationLieuTrainingSessions = (siren, idTraining, postalCode) => {
    return _get(`/backoffice/financeur/organismes_formateurs/${siren}/training/${idTraining}/sessions?postalCode=${postalCode}`);
};

export const getPlacesAdvices = (idRegion, codeFinanceur, siren, trainingId, postalCode, filter, order, page) => {

    let query = '';
    if (codeFinanceur) {
        query += `&codeFinanceur=${codeFinanceur}`;
    }
    if (filter) {
        query += `&filter=${filter}&order=${order}`;
    }
    if (page != null) {
        query += `&page=${page}`;
    }

    return _get(`/backoffice/financeur/region/${idRegion}/organisme_lieu/${siren}/advices?trainingId=${trainingId}&postalCode=${postalCode}${query}`);
};

export const loadOragnisationLieuInventory = (idRegion, codeFinanceur, siren, trainingId, postalCode) => {
    let query = '';

    if (codeFinanceur) {
        query = `&codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/organisme_lieu/${siren}/advices/inventory?trainingId=${trainingId}&postalCode=${postalCode}${query}`);
};

export const getOrganisationAdvices = (idRegion, codeFinanceur, siren, filter, order, page) => {
    let query = '';

    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (filter) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}filter=${filter}&order=${order}`;
    }
    if (page != null) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}page=${page}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/organisation/${siren}/avis${query}`);
};

export const loadInventoryASelectedOrganisation = (idRegion, codeFinanceur, siren) => {
    let query = '';

    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/organisation/${siren}/avis/inventory${query}`);
};
