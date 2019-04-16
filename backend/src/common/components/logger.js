const PrettyStream = require('bunyan-prettystream');
const bunyan = require('bunyan');
const fluent = require('fluent-logger');

let createStreams = (name, { log }) => {

    const defaultStream = () => {
        let pretty = new PrettyStream();
        pretty.pipe(process.stdout);
        return {
            name: 'pretty',
            level: log.level,
            stream: pretty,
            close: () => ({}),
        };
    };

    const jsonStream = () => {
        return {
            name: 'json',
            level: log.level,
            stream: process.stdout,
            close: () => ({}),
        };
    };

    const fluentStream = () => {

        let sender = fluent.createFluentSender('docker', {
            host: log.fluentbit.host,
            port: log.fluentbit.port,
            timeout: 3.0,
            reconnectInterval: 10000, // 10 sec
        });

        return {
            name: 'fluentbit',
            level: log.level,
            stream: sender.toStream(name),
            close: () => {
                return new Promise((resolve, reject) => {
                    sender.end('end', { message: 'Closing logger' }, err => err ? reject(err) : resolve());
                });
            }
        };
    };

    switch (log.type) {
        case 'json':
            return [jsonStream()];
        case 'fluentbit':
            return [fluentStream(), jsonStream()];
        default:
            return [defaultStream()];
    }
};


module.exports = (name, configuration) => {

    let streams = createStreams(name, configuration);
    let logger = bunyan.createLogger({
        name,
        serializers: bunyan.stdSerializers,
        streams: streams,
    });

    return {
        fatal: function() {
            logger.fatal.apply(logger, arguments);
        },
        error: function() {
            logger.error.apply(logger, arguments);
        },
        info: function() {
            logger.info.apply(logger, arguments);
        },
        debug: function() {
            logger.debug.apply(logger, arguments);
        },
        trace: function() {
            logger.trace.apply(logger, arguments);
        },
        close: () => {
            return Promise.all(streams.map(stream => stream.close()));
        }
    };
};
