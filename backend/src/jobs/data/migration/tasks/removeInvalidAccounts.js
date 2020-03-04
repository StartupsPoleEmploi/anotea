const ObjectID = require('mongodb').ObjectID;
const { getNbModifiedDocuments, getNbRemovedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let deleted = await db.collection('accounts').removeOne({ _id: new ObjectID('5ce3f23a2b1833b6dc7c5a2b') });

    let updated = await db.collection('accounts').updateMany(
        { identifiant: 'cr_guadeloupe' },
        {
            $unset: {
                raisonSocial: 1,
            },
        }
    );

    return { deleted: getNbRemovedDocuments(deleted), updated: getNbModifiedDocuments(updated) };
};
