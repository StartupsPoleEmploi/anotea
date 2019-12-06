const { jsonStream, transformObjectIntoCSV, pipeline } = require('../../common/utils/stream-utils');
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
    sendArrayAsJsonStream: (stream, res, wrapper) => {
        res.setHeader('Content-Type', 'application/json');
        stream
        .pipe(jsonStream(wrapper))
        .pipe(res)
        .on('error', () => res.status(500))
        .on('end', () => res.end());
    },
    sendCSVStream: (stream, res, columns, options = {}) => {
        let encoding = options.encoding || 'UTF-8';

        res.setHeader('Content-disposition', `attachment; filename=${options.filename || 'export.csv'}`);
        res.setHeader('Content-Type', `text/csv; charset=${encoding}`);

        return pipeline([
            stream,
            transformObjectIntoCSV(columns),
            encodeStream(encoding),
            res
        ]);
    },
    sendHTML: (res, html) => {
        res.set('Content-Type', 'text/html');
        res.send(new Buffer(html));
    },
};
