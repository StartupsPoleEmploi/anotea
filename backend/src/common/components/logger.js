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
            reconnectInterval: 10000 // 10 sec
        });

        return {
            name: 'fluentbit',
            level: log.level,
            stream: sender.toStream(name),
            close: () => sender.end(err => err ? Promise.reject(err) : Promise.resolve()),
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
            logger.fatal(arguments);
        },
        error: function() {
            logger.error(arguments);
        },
        info: function() {
            logger.info(arguments);
        },
        debug: function() {
            logger.debug(arguments);
        },
        trace: function() {
            logger.trace(arguments);
        },
        close: () => {
            return Promise.all(streams.map(stream => stream.close()));
        }
    };
};
