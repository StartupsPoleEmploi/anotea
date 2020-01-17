const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let res = await db.collection('accounts').updateMany({}, {
        $unset: {
            'firstCommentDate': 1,
            'advicesCount': 1,
            'resent': 1,
        }
    });

    return { updated: getNbModifiedDocuments(res) };
};
