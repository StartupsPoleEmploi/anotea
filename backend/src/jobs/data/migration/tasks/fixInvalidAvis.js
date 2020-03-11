const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let res = await db.collection('avis').updateMany(
        {
            status: 'none',
            commentaire: { $exists: false }
        },
        {
            $set: {
                status: 'validated',
            },
        }
    );

    return { updated: getNbModifiedDocuments(res) };
};
