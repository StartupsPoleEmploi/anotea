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
    }
};
