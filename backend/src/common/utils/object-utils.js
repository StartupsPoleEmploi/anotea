const _ = require('lodash');
const { diff } = require('deep-object-diff');

module.exports = {
    isDeepEquals: (v1, v2) => JSON.stringify(v1) === JSON.stringify(v2),
    mergeDeep: (...args) => {
        return _.merge.apply(null, [...args, (objValue, srcValue) => {
            if (_.isArray(objValue)) {
                return objValue.concat(srcValue);
            }
        }
        ]);
    },
    getDifferences: (previous, next) => ({ diff: diff(next, previous), date: new Date() }),
};
