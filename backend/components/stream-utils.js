const { Transform } = require('stream');

module.exports = {
    transformObject: (callback, options = { ignoreFirstLine: false }) => {
        let lines = 0;
        return new Transform({
            writableObjectMode: true,
            readableObjectMode: true,
            transform: async function(data, encoding, next) {
                if (options.ignoreFirstLine && lines++ === 0) {
                    return next();
                }

                let res = await callback(data);
                this.push(res);
                next();
            }
        });
    },
    jsonStream: () => {
        let chunksSent = 0;
        return new Transform({
            objectMode: true,
            transform: function(data, encoding, callback) {
                if (chunksSent === 0) {
                    this.push(new Buffer('['));
                }
                if (chunksSent++ > 0) {
                    this.push(new Buffer(','));
                }

                this.push(JSON.stringify(data));
                callback();
            },
            flush: function(callback) {
                if (chunksSent > 0) {
                    this.push(new Buffer(']'));
                } else {
                    this.push(new Buffer('[]')); //means nothing sent
                }
                return callback();
            }
        });
    }
};
