const _ = require('lodash');

module.exports = (activeRegions, path) => {
    return activeRegions.filter(region => _.get(region.mailing, path) === true).map(region => region.code_region);
};
