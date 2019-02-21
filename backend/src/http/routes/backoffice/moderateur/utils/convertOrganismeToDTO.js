const _ = require('lodash');

module.exports = organisme => {
    organisme.activated = !!organisme.passwordHash;
    return _.omit(organisme, ['passwordHash', 'token']);
};
