const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let res = await db.collection('accounts').updateMany(
        { profile: 'organisme', lieux_de_formation: { $exists: false } },
        {
            $set: {
                lieux_de_formation: [],
            },
        }
    );

    return { updated: getNbModifiedDocuments(res) };
};
