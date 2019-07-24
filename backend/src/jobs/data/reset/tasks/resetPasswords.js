const { hashPassword } = require('../../../../common/components/password');

module.exports = async (db, password) => {
    return Promise.all([
        db.collection('accounts').updateMany({ passwordHash: { $ne: null } }, {
            $set: {
                'meta.rehashed': true,
                'passwordHash': await hashPassword(password),
            }
        }),
    ]);
};
