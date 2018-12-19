const _ = require('lodash');
const moment = require('moment');
const createComponents = require('../common/components');

module.exports = {
    delay: milliseconds => {
        return new Promise(resolve => setTimeout(() => resolve(), milliseconds));
    },
    findActiveRegions: (activeRegions, path) => {
        return activeRegions.filter(region => _.get(region.mailing, path) === true).map(region => region.code_region);
    },
    capitalizeFirstLetter: string => string.charAt(0).toUpperCase() + string.slice(1),
    execute: async callback => {

        process.on('unhandledRejection', e => console.log(e));
        process.on('uncaughtException', e => console.log(e));

        let components = await createComponents();
        let logger = components.logger;
        let client = components.client;
        const exit = error => {
            if (error) {
                return logger.error(error, () => {
                    client.close(() => process.exit(1));
                });
            }
            return client.close();
        };

        let jobComponents = Object.assign({}, components, { exit, client });

        try {
            let launchTime = new Date().getTime();
            let results = await callback(jobComponents);

            let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
            logger.info(`Completed in ${duration}`);
            if (results) {
                logger.info(`Results:\n${JSON.stringify(results, null, 2)}`);
            }
            exit();
        } catch (e) {
            exit(e);
        }
    },
};
