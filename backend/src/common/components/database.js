const mongo = require('mongodb');

const connectToMongoDB = (logger, configuration) => {
    return new Promise((resolve, reject) => {
        let retries = 0;

        const retry = (delay, maxRetries) => {
            mongo.connect(configuration.mongodb.uri, { useNewUrlParser: true }, (err, client) => {
                if (err) {
                    if (retries > maxRetries) {
                        reject(err);
                    }
                    logger.error(`Failed to connect to MongoDB - retrying in ${delay} sec`, err.message);
                    retries++;
                    setTimeout(() => retry(1000, 120), delay);
                } else {
                    resolve(client);
                }
            });
        };

        retry(1000, 120); //wait for 2 minutes
    });
};

module.exports = async (logger, configuration) => {
    let client = await connectToMongoDB(logger, configuration);
    let db = client.db();
    return { client, db };
};
