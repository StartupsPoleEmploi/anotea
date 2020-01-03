const rfs = require("rotating-file-stream");
const moment = require("moment");
const findApplication = require("./findApplication");

module.exports = (logger, configuration) => {

    let stream = rfs(
        (time, index) => {
            let fileNamePrefix = configuration.log.datalake.fileNamePrefix;

            if (!time) {
                return `${fileNamePrefix}.log`;
            }

            return `${fileNamePrefix}-${moment(time).format("YYYY-MM-DD")}-${index}.log`;
        }, {
            interval: "1d",
            path: configuration.log.datalake.path,
        }
    );

    stream.on("error", err => logger.error(err, "Unable to export log to datalake file. Stream closed"));

    return {
        export: data => {
            try {
                let headers = data.request.headers;

                stream.write(JSON.stringify({
                    requestId: data.request.requestId,
                    date: new Date(),
                    apiVersion: "v1",
                    application: findApplication(data.request),
                    widget: !!headers["x-anotea-widget"],
                    statusCode: data.response.statusCode

                }) + "\n");
            } catch (e) {
                logger.error(e, "Unable to export log to datalake file");
            }
        },
    };
};
