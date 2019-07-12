const rfs = require('rotating-file-stream');
const _ = require('lodash');
const moment = require('moment');

module.exports = (logger, configuration) => {

    let stream = rfs(
        (time, index) => {
            let fileNamePrefix = configuration.log.datalake.fileNamePrefix;

            if (!time) {
                return `${fileNamePrefix}.log`;
            }

            return `${fileNamePrefix}-${moment(time).format('YYYY-MM-DDTmm-ss')}-${index}.log`;
        }, {
            interval: '1d',
            path: configuration.log.datalake.path,
        }
    );

    stream.on('error', err => logger.error(err, 'Unable to export log to datalake file. Stream closed'));

    const findApplication = request => {

        let headers = request.headers;

        if (headers['x-anotea-widget']) {
            try {
                let url = new URL(headers['x-anotea-widget']);
                return url.host;
            } catch (e) {
                return 'public';
            }
        }

        let authorization = headers['authorization'];
        if (authorization && authorization.startsWith('ANOTEA-HMAC-SHA256 ')) {
            return authorization.replace(/ANOTEA-HMAC-SHA256 /, '').split(':')[0];
        }

        return 'public';
    };
    return {
        export: data => {
            try {
                let headers = data.request.headers;

                stream.write(JSON.stringify({
                    requestId: data.request.requestId,
                    date: new Date(),
                    apiVersion: 'v1',
                    application: findApplication(data.request),
                    widget: !!headers['x-anotea-widget'],
                    statusCode: data.response.statusCode

                }) + '\n');
            } catch (e) {
                logger.error(e, 'Unable to export log to datalake file');
            }
        },
    };
};
