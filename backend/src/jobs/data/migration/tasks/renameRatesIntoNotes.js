const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {

    let res = await db.collection('avis').updateMany({},
        {
            $rename: {
                'rates': 'notes',
            },
        }
    );

    return { renamed: getNbModifiedDocuments(res) };
};
