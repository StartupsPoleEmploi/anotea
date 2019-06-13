const indexes = require('./mongoIndexes');

module.exports = (db, collectionNames) => {
    return Promise.all(
        Object.keys(indexes)
        .filter(key => !collectionNames || collectionNames.includes(key))
        .map(key => indexes[key](db))
    );
};
