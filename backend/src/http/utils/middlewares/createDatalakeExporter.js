const rfs = require('rotating-file-stream');
const moment = require('moment');

module.exports = (logger, configuration) => {

    const streamV1 = rfs.createStream(
        (time, index) => {
            let fileNamePrefix = configuration.log.datalake.fileNamePrefix;

            if (!time) {
                return `${fileNamePrefix}.log`;
            }

            return `${fileNamePrefix}-${moment(time).format('YYYY-MM-DD')}-${index}.log`;
        }, {
            interval: '1d',
            path: configuration.log.datalake.path,
        }
    );

    streamV1.on('error', err => logger.error(err, 'Unable to export log to datalake file. Stream closed'));

    const streamV2 = rfs.createStream(
        // eslint-disable-next-line no-unused-vars
        (time, index) => {
            let fileNamePrefix = `statsesd_${configuration.log.datalake.fileNamePrefix}`;

            if (!time) {
                return `${fileNamePrefix}.log`;
            }

            return `${fileNamePrefix}_${moment(time).format('YYYY-MM-DD')}.log`;
        }, {
            interval: '1d',
            path: configuration.log.datalake.path,
        }
    );

    streamV2.on('error', err => logger.error(err, 'Unable to export log to datalake file. Stream closed'));

    return {
        export: data => {
            try {
                let headers = data.request.headers;

                streamV1.write(JSON.stringify({
                    requestId: data.request.requestId,
                    date: new Date(),
                    apiVersion: 'v1',
                    application: data.application,
                    widget: !!headers['x-anotea-widget'],
                    statusCode: data.response.statusCode
                }) + '\n');
                streamV2.write(JSON.stringify({
                    startup: 'anotea',
                    requestId: data.request.requestId,
                    date: new Date(),
                    remoteIP: headers['x-real-ip'],
                    httpReferer: headers['referer'],
                    httpUserAgent: headers['user-agent'],
                    status: data.response.statusCode,
                    apiVersion: 'v1',
                    widget: !!headers['x-anotea-widget'],
                    application: data.application,
                }) + '\n');
            } catch (e) {
                logger.error(e, 'Unable to export log to datalake file');
            }
        },
    };
};
