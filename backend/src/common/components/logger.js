const PrettyStream = require('bunyan-prettystream');
const bunyan = require('bunyan');

module.exports = (name, configuration) => {

    const prettyConsoleStream = () => {
        let pretty = new PrettyStream();
        pretty.pipe(process.stdout);
        return {
            level: configuration.log.level,
            stream: pretty,
        };
    };

    const jsonConsoleStream = () => {
        return {
            level: configuration.log.level,
            stream: process.stdout,
        };
    };

    const fileStream = () => {
        return {
            type: 'rotating-file',
            level: configuration.log.level,
            path: configuration.log.file,
            period: '1d',
            count: 31,
        };
    };

    return bunyan.createLogger({
        name,
        serializers: bunyan.stdSerializers,
        streams: [
            ...(configuration.log.console === 'json' ? [jsonConsoleStream()] : [prettyConsoleStream()]),
            ...(configuration.log.file ? [fileStream()] : [])
        ],
    });
};
