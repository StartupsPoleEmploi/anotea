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
        };
    };

    const jsonStream = () => {
        return {
            name: 'json',
            level: log.level,
            stream: process.stdout,
        };
    };

    const fluentStream = () => {

        let sender = fluent.createFluentSender('docker', {
            host: log.fluentbit.host,
            port: log.fluentbit.port,
            timeout: 3.0,
            reconnectInterval: 30000 // 30 sec
        });

        return {
            name: 'fluentbit',
            level: log.level,
            stream: sender.toStream(name),
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

    return bunyan.createLogger({
        name,
        serializers: bunyan.stdSerializers,
        streams: createStreams(name, configuration),
    });
};
