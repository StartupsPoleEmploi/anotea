const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let res = await db.collection('accounts').updateMany(
        {
            $and: [
                { 'lieux_de_formation.adresse.code_postal': /^976/ },
                { 'lieux_de_formation.adresse.code_postal': { $not: { $regex: '^974' } } },
            ],
        },
        {
            $set: {
                codeRegion: '06',
            },
        }
    );

    return { updated: getNbModifiedDocuments(res) };
};
