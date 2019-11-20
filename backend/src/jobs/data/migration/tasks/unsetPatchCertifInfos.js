const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let [trainee, comment] = await Promise.all([
        db.collection('trainee').updateMany({}, {
            $unset: {
                'meta.patch.certifInfo': '1',
            }
        }),
        db.collection('comment').updateMany({}, {
            $unset: {
                'meta.patch.certifInfo': '1',
            }
        }),
    ]);

    return { trainee: getNbModifiedDocuments(trainee), comment: getNbModifiedDocuments(comment) };
};
