const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let res = await db.collection('accounts').updateMany(
        {
            profile: 'organisme',
        },
        {
            $rename: { 'raisonSociale': 'raison_sociale' },
        }
    );

    return { updated: getNbModifiedDocuments(res) };
};
