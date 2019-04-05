const _ = require('lodash');

module.exports = organisme => {
    organisme.status = organisme.passwordHash ? 'active' : 'inactive';
    return _.omit(organisme, ['passwordHash', 'token']);
};
