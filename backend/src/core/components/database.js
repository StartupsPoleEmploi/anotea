const { MongoClient: mongo } = require('mongodb');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectToMongoDB = async (logger, configuration) => {
    const retry = async (delay, maxRetries, attempt = 0) => {
        try {
            return await mongo.connect(configuration.mongodb.uri);
        } catch (err) {
            if (attempt >= maxRetries) {
                throw err;
            }
            logger.error(`Failed to connect to MongoDB - retrying in ${delay} sec`, err.message);
            await wait(delay);
            return retry(delay, maxRetries, attempt + 1);
        }
    };

    return retry(1000, 120); // attend jusqu'à 2 minutes
};

module.exports = async (logger, configuration) => {
    let client = await connectToMongoDB(logger, configuration);
    let db = client.db();
    return { client, db };
};
