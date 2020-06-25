const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {

    let res = await db.collection('statistics').updateMany({}, [
        { '$set': { 'regions.11.avis.nbAvis': '$regions.11.api.nbAvis' } }
    ]);

    return { updated: getNbModifiedDocuments(res) };
};
