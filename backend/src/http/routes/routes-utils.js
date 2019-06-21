const Boom = require('boom');
const { transformObject, jsonStream } = require('../../common/utils/stream-utils');
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
        .pipe(res);
    },
    sendCSVStream: (stream, res, columnNames, transform) => {
        res.setHeader('Content-disposition', 'attachment; filename=contact-stagiaires.csv');
        res.setHeader('Content-Type', 'text/csv; charset=iso-8859-1');
        res.write(columnNames);

        stream
        .on('error', e => {
            res.status(500);
            stream.push(Boom.boomify(e).output.payload);
        })
        .pipe(transformObject(doc => transform(doc)))
        .pipe(encodeStream('UTF-16BE'))
        .pipe(res)
        .on('end', () => res.end());
    },
};
