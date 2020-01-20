const _ = require('lodash');
const { getNbModifiedDocuments } = require('../../../job-utils');
const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let unset = await db.collection('avis').updateMany({ pseudo: '' }, {
        $unset: {
            pseudo: 1,
        }
    });

    let accordResults = 0;
    let cursor = db.collection('avis').find({
        $or: [
            { 'meta.deprecated.accord': { $exists: true } },
            { 'meta.deprecated.accordEntreprise': { $exists: true } },
        ]
    });
    await batchCursor(cursor, async next => {
        let avis = await next();
        let accord = _.get(avis, 'meta.deprecated.accord');
        let accordEntreprise = _.get(avis, 'meta.deprecated.accordEntreprise');

        let results = await db.collection('avis').updateOne({ _id: avis._id }, {
            $push: {
                'meta.history': {
                    $each: [
                        ...(accord ? [{ date: new Date(), accord }] : []),
                        ...(accordEntreprise ? [{ date: new Date(), accordEntreprise }] : []),
                    ],
                    $position: 0
                }
            },
        });

        accordResults += getNbModifiedDocuments(results);
    });

    let pseudoResults = 0;
    cursor = db.collection('avis').find({ pseudo: { $exists: true } });
    await batchCursor(cursor, async next => {
        let avis = await next();

        let results = await db.collection('avis').updateOne({ _id: avis._id }, {
            $push: {
                'meta.history': {
                    $each: [
                        { date: new Date(), pseudo: avis.pseudo },
                    ],
                    $position: 0
                }
            },
            $unset: {
                'pseudo': 1,
                'meta.deprecated': 1,
            },
        });

        pseudoResults += getNbModifiedDocuments(results);
    });


    return { unset: getNbModifiedDocuments(unset), pseudo: pseudoResults, accord: accordResults };
};
