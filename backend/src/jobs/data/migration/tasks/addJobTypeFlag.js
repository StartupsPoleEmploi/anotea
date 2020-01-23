const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let res = await db.collection('jobs').updateMany({},
        {
            $set: {
                type: 'import-stagiaires',
            },
        }
    );

    return { updated: getNbModifiedDocuments(res) };
};
