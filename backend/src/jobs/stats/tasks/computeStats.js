const computeOrganismesStats = require('./stats/computeOrganismesStats');
const computeAvisStats = require('./stats/computeAvisStats');
const computeApiStats = require('./stats/computeApiStats');
const computeCampaignStats = require('./stats/computeCampaignStats');

module.exports = async (db, regions) => {

    let stats = await Promise.all([
        computeOrganismesStats(db, regions),
        computeAvisStats(db, regions),
        computeApiStats(db, regions),
        computeCampaignStats(db, regions),
    ]);

    await db.collection('statistics').insertOne({
        date: new Date(),
        organismes: stats[0],
        avis: stats[1],
        api: stats[2],
        campaign: stats[3],
    });

    return { computed: true };
};
