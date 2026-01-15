const { MongoClient: mongo } = require('mongodb');

const connectToMongoDB = async (logger, configuration) => {
    const retry = (delay, maxRetries) => {
        try {
            return mongo.connect(configuration.mongodb.uri);
        } catch (err) {
            if (retries > maxRetries) {
                reject(err);
            }
            logger.error(`Failed to connect to MongoDB - retrying in ${delay} sec`, err.message);
            retries++;
            setTimeout(() => retry(1000, 120), delay);
        }
    }
    return retry(1000, 120); //wait for 2 minutes
};

module.exports = async (logger, configuration) => {
    let client = await connectToMongoDB(logger, configuration);
    let db = client.db();
    return { client, db };
};
