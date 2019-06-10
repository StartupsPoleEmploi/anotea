const { jsonStream } = require('../../common/utils/stream-utils');

module.exports = {
    getRemoteAddress: req => {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    },
    tryAndCatch: callback => {
        return async (req, res, next) => {
            try {
                await callback(req, res, next);
            } catch (e) {
                return next(e);
            }
        };
    },
    sendJsonStream: (stream, res, wrapper) => {
        res.setHeader('Content-Type', 'application/json');
        stream
        .pipe(jsonStream(wrapper))
        .pipe(res);
    },
};
