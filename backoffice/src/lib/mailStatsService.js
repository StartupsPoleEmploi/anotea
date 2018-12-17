import { _get } from '../utils/http-client';

export const getDashboardData = (codeRegion, year) => {
    return _get(`/backoffice/financeur/region/${codeRegion}/mailStats/${year}`);
};

export const getGraphData = (codeRegion, year) => {
    return _get(`/backoffice/financeur/region/${codeRegion}/mailStats/${year}/months`);
};
