const computeOrganismesStats = require('./stats/computeOrganismesStats');
const computeAvisStats = require('./stats/computeAvisStats');
const computeApiStats = require('./stats/computeApiStats');
const computeCampagnesStats = require('./stats/computeCampagnesStats');

module.exports = async (db, regions) => {

    let regional = await Promise.all(regions.findActiveRegions().map(async region => {
        let codeRegion = region.codeRegion;

        let [api, organismes, avis] = await Promise.all([
            computeApiStats(db, codeRegion),
            computeOrganismesStats(db, codeRegion),
            computeAvisStats(db, codeRegion),
        ]);

        return {
            codeRegion,
            api,
            organismes,
            avis,
        };
    }));

    let [api, organismes, avis, campagnes] = await Promise.all([
        computeApiStats(db),
        computeOrganismesStats(db),
        computeAvisStats(db),
        computeCampagnesStats(db),
    ]);

    await db.collection('statistics').insertOne({
        date: new Date(),
        national: {
            api,
            organismes,
            avis,
            campagnes,
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
