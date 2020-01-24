import { _get } from '../../common/utils/http-client';
import queryString from 'query-string';

export const getStagiairesStats = (options = {}) => {
    return _get(`/backoffice/stats/stagiaires?${queryString.stringify(options)}`);
};

export const getAvisStats = (options = {}) => {
    return _get(`/backoffice/stats/avis?${queryString.stringify(options)}`);
};

export const getPublicStats = (options = {}) => {
    return _get(`/stats?${queryString.stringify(options)}`);
};

export const divide = (dividend, divisor) => {
    if (dividend && divisor !== 0) {
        let value = dividend / divisor;
        return Number(Math.round(value + 'e1') + 'e-1');
    } else {
        return 0;
    }
};

export const percentage = (dividend, divisor) => {
    return `${divide(dividend * 100, divisor)}%`;
};

export const latest = history => {
    return history[history.length - 1].value;
};
