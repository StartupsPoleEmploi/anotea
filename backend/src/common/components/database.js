const mongo = require('mongodb');

const connectToMongoDB = (logger, configuration) => {
    return new Promise(resolve => {
        mongo.connect(configuration.mongodb.uri, { useNewUrlParser: true }, (err, client) => {
            if (err) {
                logger.error('Failed to connect to MongoDB - retrying in 5 sec', err.message);
                //TODO we should add a maxRetry
                return setTimeout(() => connectToMongoDB(logger, configuration), 5000);
            }
            resolve(client);
        });
    });
};

module.exports = async (logger, configuration) => {
    let client = await connectToMongoDB(logger, configuration);
    let db = client.db();
    return { client, db };
};
