const rfs = require('rotating-file-stream');
const moment = require('moment');

module.exports = (logger, configuration) => {

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

                const referer = headers['referer'];
                if (!referer || !referer.startsWith('https://api.emploi-store.fr/')) {
                    streamV2.write(JSON.stringify({
                        startup: 'anotea',
                        requestId: data.request.requestId,
                        date: new Date(),
                        remoteIP: headers['x-real-ip'],
                        httpReferer: referer,
                        httpUserAgent: headers['user-agent'],
                        status: data.response.statusCode,
                        apiVersion: 'v1',
                        widget: !!headers['x-anotea-widget'],
                        application: data.application,
                    }) + '\n');
                }
            } catch (e) {
                logger.error(e, 'Unable to export log to datalake file');
            }
        },
    };
};
