const mongo = require('mongodb');

module.exports = uri => mongo.connect(uri, { useNewUrlParser: true });
