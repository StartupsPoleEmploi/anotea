const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let results = await db.collection('trainee').updateMany({ 'trainee.phoneNumbers': { $in: ['NULL', ''] } }, {
        $pull: {
            'trainee.phoneNumbers': { $in: ['NULL', ''] },
        }
    },);

    return getNbModifiedDocuments(results);
};
