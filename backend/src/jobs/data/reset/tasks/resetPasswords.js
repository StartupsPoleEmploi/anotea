const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async (db, passwords, password, options = {}) => {

    let res = await db.collection('accounts').updateMany(options.force ? {} : { passwordHash: { $ne: null } }, {
        $set: {
            'meta.rehashed': true,
            'passwordHash': await passwords.hashPassword(password),
        }
    });

    return {
        passwords: getNbModifiedDocuments(res),
    };
};
