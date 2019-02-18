const _ = require('lodash');
const moment = require('moment');
const createComponents = require('../components');
const createLogger = require('../common/components/logger');

module.exports = {
    delay: milliseconds => {
        return new Promise(resolve => setTimeout(() => resolve(), milliseconds));
    },
    findActiveRegions: (activeRegions, path) => {
        return activeRegions.filter(region => _.get(region.mailing, path) === true).map(region => region.code_region);
    },
    capitalizeFirstLetter: string => string.charAt(0).toUpperCase() + string.slice(1),
    execute: async job => {

        process.on('unhandledRejection', e => console.log(e));
        process.on('uncaughtException', e => console.log(e));

        let components = await createComponents();
        let logger = createLogger('anotea-job', components.configuration);
        const exit = error => {
            if (error) {
                logger.error(error);
            }
            return components.client.close();
        };

        let jobComponents = Object.assign({}, components, { logger, exit });

        try {
            let launchTime = new Date().getTime();
            let results = await job(jobComponents);

            let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
            let data = {};
            if (results) {
                data = results.toJSON ? results.toJSON() : results;
                if (results.constructor === Array) {
                    data = results.map(r => r.toJSON ? r.toJSON() : r);
                }
            }
            logger.info({ data }, `Completed in ${duration}`);
            exit();
        } catch (e) {
            exit(e);
        }
    },
};
