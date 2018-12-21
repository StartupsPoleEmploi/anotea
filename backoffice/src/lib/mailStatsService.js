import { _get } from '../utils/http-client';

const getFilterCodeFinanceur = codeFinanceur => codeFinanceur === 'all' ? '' : `?codeFinanceur=${codeFinanceur}`;

export const getDashboardData = (codeRegion, year, codeFinanceur) => {
    return _get(`/backoffice/financeur/region/${codeRegion}/mailStats/${year}${getFilterCodeFinanceur(codeFinanceur)}`);
};

export const getGraphData = (codeRegion, year, codeFinanceur) => {
    return _get(`/backoffice/financeur/region/${codeRegion}/mailStats/${year}/months${getFilterCodeFinanceur(codeFinanceur)}`);
};
