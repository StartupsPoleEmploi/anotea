const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let [status, reponse] = await Promise.all([
        db.collection('comment').updateMany({ 'status': 'published' }, {
            $set: {
                'status': 'validated',
            }
        }),
        db.collection('comment').updateMany({ 'reponse.status': 'published' }, {
            $set: {
                'reponse.status': 'validated',
            }
        }),
    ]);

    return { status: getNbModifiedDocuments(status), reponse: getNbModifiedDocuments(reponse) };
};
