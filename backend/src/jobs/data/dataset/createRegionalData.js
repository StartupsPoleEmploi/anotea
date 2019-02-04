const departements = require('../../../../test/helpers/data/departements.json');
const regions = require('../../../../test/helpers/data/regions.json');

module.exports = async db => {
    return Promise.all([
        Promise.all(departements.map(departement => db.collection('departements').insertOne(departement))),
        Promise.all(regions.map(region => db.collection('regions').insertOne(region))),
    ]);
};
