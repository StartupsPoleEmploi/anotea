const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let [accord, accordEntreprise] = await Promise.all([
        db.collection('comment').updateMany({ accord: { $exists: true } }, {
            $rename: {
                'accord': 'meta.deprecated.accord',
            }
        }),
        db.collection('comment').updateMany({ accordEntreprise: { $exists: true } }, {
            $rename: {
                'accordEntreprise': 'meta.deprecated.accordEntreprise',
            }
        }),
    ]);

    return { accord: getNbModifiedDocuments(accord), accordEntreprise: getNbModifiedDocuments(accordEntreprise) };
};
