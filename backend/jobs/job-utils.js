const _ = require('lodash');

module.exports = {
    delay: milliseconds => {
        return new Promise(resolve => setTimeout(() => resolve(), milliseconds));
    },
    findActiveRegions: (activeRegions, path) => {
        return activeRegions.filter(region => _.get(region.mailing, path) === true).map(region => region.code_region);
    },
    capitalizeFirstLetter: string => string.charAt(0).toUpperCase() + string.slice(1),
    catchUnexpectedErrors: callback => {
        process.on('unhandledRejection', e => callback(e));
        process.on('uncaughtException', e => callback(e));
    },
};
