const computeOrganismesStats = require('./stats/computeOrganismesStats');
const computeAvisStats = require('./stats/computeAvisStats');
const computeApiStats = require('./stats/computeApiStats');
const computeCampagnesStats = require('./stats/computeCampagnesStats');

module.exports = async (db, regions) => {

    let national = await Promise.all([
        computeOrganismesStats(db),
        computeAvisStats(db),
        computeApiStats(db),
        computeCampagnesStats(db),
    ]);

    let regional = await Promise.all(regions.findActiveRegions().map(async region => {
        let codeRegion = region.codeRegion;

        let all = await Promise.all([
            computeOrganismesStats(db, codeRegion),
            computeAvisStats(db, codeRegion),
            computeApiStats(db, codeRegion),
        ]);

        return {
            codeRegion,
            api: all[0],
            organismes: all[1],
            avis: all[2],
        };
    }));

    await db.collection('statistics').insertOne({
        date: new Date(),
        national: {
            api: national[0],
            organismes: national[1],
            avis: national[2],
            campagnes: national[3],
        },
        regions: regional.reduce((acc, r) => {
            return {
                ...acc,
                [r.codeRegion]: r,
            };
        }, {}),
    });

    return { computed: true };
};
