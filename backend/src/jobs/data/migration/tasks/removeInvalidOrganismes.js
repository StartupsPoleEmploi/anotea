const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {
    let res = await db.collection('accounts').removeMany({ SIRET: 0 });

    return { organismes: getNbModifiedDocuments(res) };
};
