const PrettyStream = require('bunyan-prettystream');
const bunyan = require('bunyan');

module.exports = configuration => {

    const prettyStream = () => {
        let pretty = new PrettyStream();
        pretty.pipe(process.stdout);
        return {
            name: 'pretty',
            level: configuration.log.level,
            stream: pretty,
        };
    };

    const jsonStream = () => {
        return {
            name: 'json',
            level: configuration.log.level,
            stream: process.stdout,
        };
    };


    return bunyan.createLogger({
        name: 'anotea',
        serializers: bunyan.stdSerializers,
        streams: [configuration.log.console.json ? jsonStream() : prettyStream()],
    });
};
