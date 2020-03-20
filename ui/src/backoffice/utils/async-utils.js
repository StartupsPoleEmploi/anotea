import _ from 'lodash';

export const promiseAll = async data => {
    if (_.isPlainObject(data)) {
        return _.zipObject(_.keys(data), await Promise.all(_.values(data)));
    }
    return Promise.all(data);

};

