const { jsonStream, transformObjectIntoCSV } = require('../../common/utils/stream-utils');
const { encodeStream } = require('iconv-lite');

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
        .pipe(res)
        .on('error', () => res.status(500))
        .on('end', () => res.end());
    },
    sendCSVStream: (stream, res, columns, options = {}) => {
        res.setHeader('Content-disposition', `attachment; filename=${options.filename || 'export.csv'}`);
        res.setHeader('Content-Type', 'text/csv; charset=iso-8859-1');

        stream
        .pipe(transformObjectIntoCSV(columns))
        .pipe(encodeStream('UTF-8'))
        .pipe(res)
        .on('error', () => res.status(500))
        .on('end', () => res.end());
    },
};
