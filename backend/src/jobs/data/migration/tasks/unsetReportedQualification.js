const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let res = await db.collection('comment').updateMany({ 'status': 'reported' }, {
        $unset: {
            'qualification': 1,
        }
    });

    return { updated: getNbModifiedDocuments(res) };
};
