const { getNbModifiedDocuments } = require('../../../job-utils');
const { batchCursor } = require('../../../job-utils');

let mapper = {
    '2': '84',
    '3': '27',
    '4': '53',
    '5': '24',
    '6': '94',
    '7': '44',
    '8': '01',
    '9': '03',
    '10': '32',
    '11': '11',
    '12': '04',
    '13': '02',
    '14': '28',
    '15': '75',
    '16': '76',
    '17': '52',
    '18': '93',
};

module.exports = async db => {

    let updateCodeRegion = async collectionName => {
        let updated = 0;

        let cursor = db.collection(collectionName).find();
        await batchCursor(cursor, async next => {
            let doc = await next();

            let res = await db.collection(collectionName).updateOne({ _id: doc._id }, {
                $set: {
                    codeRegion: mapper[doc.codeRegion],
                },
                $unset: {
                    codeINSEE: 1,
                }
            });

            updated += getNbModifiedDocuments(res);
        });

        return updated;
    };


    let [stagiaires, avis, accounts] = await Promise.all([
        updateCodeRegion('stagiaires'),
        updateCodeRegion('avis'),
        updateCodeRegion('accounts'),
    ]);

    return { stagiaires, avis, accounts };
};
