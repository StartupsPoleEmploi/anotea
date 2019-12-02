const _ = require('lodash');
const { diff } = require('deep-object-diff');

let flattenKeys = (obj, path = []) => {
    return !_.isObject(obj) ? { [path.join('.')]: obj } :
        _.reduce(obj, (cum, next, key) => _.merge(cum, flattenKeys(next, [...path, key])), {});
};

module.exports = {
    isDeepEquals: (v1, v2) => JSON.stringify(v1) === JSON.stringify(v2),
    mergeDeep: (...args) => {
        return _.mergeWith.apply(null, [...args, (objValue, srcValue) => {
            if (_.isArray(objValue)) {
                return _.uniq(_.union(objValue, srcValue));
            }
        }
        ]);
    },
    getDifferences: (previous, next) => diff(next, previous),
    flattenKeys
};
