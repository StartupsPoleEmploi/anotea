const _ = require('lodash');

module.exports = {
    findActiveRegions: (activeRegions, path) => {
        return activeRegions.filter(region => _.get(region.jobs, path) === true).map(region => region.code_region);
    },
};
