import { _get } from '../../common/utils/http-client';
import queryString from 'query-string';
import _ from 'lodash';

export const getPublicStats = (options = {}) => {
    return _get(`/backoffice/stats?${queryString.stringify(options)}`);
};

export const diff = (stats, type, path) => {
    let latest = stats[0];
    let oldest = stats[stats.length - 1];

    return _.get(latest, `${type}.${path}`, 0) - _.get(oldest, `${type}.${path}`, 0);
};

export const avg = (stats, type, path) => {

    let sum = stats.reduce((acc, item) => {
        return acc + _.get(item, `${type}.${path}`);
    }, 0);

    return Math.round(sum / stats.length);
};

export const latest = (stats, type, path) => {
    let latest = stats[0];
    return _.get(latest, `${type}.${path}`);
};
