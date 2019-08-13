import { _get } from '../../../../utils/http-client';

export const getRegions = () => {
    
    return _get(`/regions`);
};

export const getOrganisations = (idregion, codeFinanceur, departement) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (departement) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}departement=${departement}`;
    }
    return _get(`/backoffice/financeur/region/${idregion}/organisations${query}`);
};

export const getAdvices = (idRegion, codeFinanceur, departement, organisation, place, formation, filter, order, page) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (departement) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}departement=${departement}`;
    }
    if (organisation) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}organisation=${organisation}`;
    }
    if (place) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}place=${place}`;
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

export const getPlaces = (idRegion, codeFinanceur, departement, siren) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (departement) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}departement=${departement}`;
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

export const getFormations = (idRegion, codeFinanceur, siren, postalCode) => {
    let query = '';
    if (codeFinanceur) {
        query = `&codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/organisme_formateur/${siren}/trainings?postalCode=${postalCode}${query}`);
};

export const getOrganisationLieuTrainingSessions = (siren, idTraining, postalCode) => {
    return _get(`/backoffice/financeur/organismes_formateurs/${siren}/training/${idTraining}/sessions?postalCode=${postalCode}`);
};

export const getInventory = (idRegion, codeFinanceur, departement, organisation, place, formation) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (departement) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}departement=${departement}`;
    }
    if (organisation) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}organisation=${organisation}`;
    }
    if (place) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}place=${place}`;
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
