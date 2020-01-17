const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let res = await db.collection('accounts').updateMany(
        {
            $or: [
                { profile: 'moderateur' },
                { profile: 'financeur' },
            ]
        },
        {
            $rename: { 'courriel': 'identifiant' },
            $unset: {
                score: 1,
            }
        }
    );

    return { updated: getNbModifiedDocuments(res) };
};
