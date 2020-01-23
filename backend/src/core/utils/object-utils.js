const { diff } = require('deep-object-diff');

module.exports = {
    getDifferences: (previous, next) => diff(next, previous),
};
