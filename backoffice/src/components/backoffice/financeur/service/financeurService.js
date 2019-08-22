import { _get } from '../../../../utils/http-client';

export const getRegions = () => {
    
    return _get(`/regions`);
};

export const getOrganisations = (idregion, startDate, endDate, codeFinanceur, lieu) => {
    let query = '';
    if (startDate && endDate) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}startDate=${startDate}&endDate=${endDate}`;
    }
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (lieu) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}lieu=${lieu}`;
    }
    return _get(`/backoffice/financeur/region/${idregion}/organisations${query}`);
};

export const getAdvices = (idRegion, startDate, endDate, codeFinanceur, lieu, organisation, formation, filter, order, page) => {
    let query = '';
    if (startDate && endDate) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}startDate=${startDate}&endDate=${endDate}`;
    }
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (lieu) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}lieu=${lieu}`;
    }
    if (organisation) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}organisation=${organisation}`;
    }
    if (formation) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}formation=${formation}`;
    }
    if (filter) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}filter=${filter}&order=${order}`;
    }
    if (page !== null) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}page=${page}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/advices${query}`);
};

export const getPlaces = (idRegion, codeFinanceur, siren) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (siren) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}siren=${siren}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/places${query}`);
};

export const getFormations = (idRegion, startDate, endDate, codeFinanceur, siren, lieu) => {
    let query = '';
    if (startDate && endDate) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}startDate=${startDate}&endDate=${endDate}`;
    }
    if (codeFinanceur) {
        query = `&codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/organisme_formateur/${siren}/trainings?lieu=${lieu}${query}`);
};

export const getOrganisationLieuTrainingSessions = (siren, idTraining, codeINSEE) => {
    return _get(`/backoffice/financeur/organismes_formateurs/${siren}/training/${idTraining}/sessions?codeINSEE=${codeINSEE}`);
};

export const getInventory = (idRegion, startDate, endDate, codeFinanceur, lieu, organisation, formation) => {
    let query = '';
    if (startDate && endDate) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}startDate=${startDate}&endDate=${endDate}`;
    }
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (lieu) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}lieu=${lieu}`;
    }
    if (organisation) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}organisation=${organisation}`;
    }
    if (formation) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}formation=${formation}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/inventory${query}`);
};
