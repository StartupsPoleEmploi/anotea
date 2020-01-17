const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let res = await db.collection('stagiaires').updateMany({},
        {
            $rename: { 'trainee': 'personal' },
        }
    );

    return { updated: getNbModifiedDocuments(res) };
};
