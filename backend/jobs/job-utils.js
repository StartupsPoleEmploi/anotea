const _ = require('lodash');
const { Transform } = require('stream');
const throughParallel = require('through2-parallel');

module.exports = {
    handleBackPressure: callback => {
        let lines = 0;
        return new Transform({
            writableObjectMode: true,
            readableObjectMode: true,
            transform: async function(data, encoding, next) {
                if (lines++ === 0) {
                    return next();
                }

                let res = await callback(data);
                this.push(res);
                next();
            }
        });
    },
    transformParallel: callback => {
        let options = { objectMode: true, concurrency: 4 };
        return throughParallel(options, async function(chunk, enc, next) {
            let res = await callback(chunk);
            this.push(res);
            next();
        });
    },
    delay: seconds => {
        return new Promise(resolve => setTimeout(() => resolve(), seconds * 1000));
    },
    findActiveRegions: (activeRegions, path) => {
        return activeRegions.filter(region => _.get(region.mailing, path) === true).map(region => region.code_region);
    },
    capitalizeFirstLetter: string => string.charAt(0).toUpperCase() + string.slice(1),
};
