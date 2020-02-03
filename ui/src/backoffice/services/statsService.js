import { _get } from '../../common/utils/http-client';
import queryString from 'query-string';
import _ from 'lodash';

export const getPublicStats = (options = {}) => {
    return _get(`/backoffice/stats?${queryString.stringify(options)}`);
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


export const diff = (stats, type, path) => {
    let latest = stats[0];
    let oldest = stats[stats.length - 1];

    return _.get(latest, `${type}.${path}`) - _.get(oldest, `${type}.${path}`);
};

export const avg = (stats, type, path) => {

    let sum = stats.reduce((acc, item) => {
        return acc + _.get(item, `${type}.${path}`);
    }, 0);

    return Math.round(sum / stats.length);
};
