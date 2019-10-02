module.exports = async (db, passwords, password, options = {}) => {
    return Promise.all([
        db.collection('accounts').updateMany(options.force ? {} : { passwordHash: { $ne: null } }, {
            $set: {
                'meta.rehashed': true,
                'passwordHash': await passwords.hashPassword(password),
            }
        }),
    ]);
};
