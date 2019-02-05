const { hashPassword } = require('../../../common/components/password');

module.exports = async (db, password) => {

    await Promise.all([
        db.collection('accounts').insertOne({
            profile: 'financeur',
            courriel: 'cr',
            codeRegion: '11',
            codeFinanceur: '2',
        }),
        db.collection('accounts').insertOne({
            profile: 'moderateur',
            courriel: 'moderateur@pole-emploi.fr',
            codeRegion: '11',
            features: [
                'EDIT_ORGANISATIONS'
            ],
        }),
    ]);

    return db.collection('accounts').updateMany({}, {
        $set: {
            'meta.rehashed': true,
            'passwordHash': await hashPassword(password),
        }
    });
};
