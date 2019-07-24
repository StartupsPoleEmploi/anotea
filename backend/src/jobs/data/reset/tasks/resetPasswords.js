const { hashPassword } = require('../../../../common/components/password');

module.exports = async (db, password, options = {}) => {
    return Promise.all([
        db.collection('accounts').updateMany(options.force ? {} : { passwordHash: { $ne: null } }, {
            $set: {
                'meta.rehashed': true,
                'passwordHash': await hashPassword(password),
            }
        }),
    ]);
};
