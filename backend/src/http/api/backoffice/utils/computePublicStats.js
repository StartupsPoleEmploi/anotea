const moment = require('moment');

module.exports = async (db, type, fields, filters = {}) => {

    let res = await db.collection('statistics').aggregate([
        {
            $match: {
                $and: [
                    ...(filters.debut ? [{ date: { $gte: moment(filters.debut).toDate() } }] : []),
                    ...(filters.fin ? [{ date: { $lte: moment(filters.fin).toDate() } }] : []),
                ]
            },
        },
        {
            $project: {
                date: 1,
                [type]: 1,
            },
        },
        {
            $unwind: `$${type}`
        },
        {
            $group: {
                _id: `$${type}.label`,
                label: { $first: `$${type}.label` },
                codeRegions: { $first: `$${type}.codeRegions` },
                ...fields.reduce((acc, field) => {
                    return {
                        ...acc,
                        ...{ [field]: { $push: { value: `$${type}.${field}`, date: '$date' } } },
                    };
                }, {}),
            },
        },
    ]).toArray();

    if (res.length === 0) {
        return {};
    }

    let national = res.find(r => r.label === 'Toutes');
    let regional = res.find(r => r.codeRegions.length === 1 && r.codeRegions.includes(filters.codeRegion));

    return {
        ...(filters.codeRegion ? { regional } : {}),
        national: Object.keys(national).reduce((acc, key) => {
            if (key.startsWith('nb')) {
                acc[key] = national[key].map(({ date, value }) => {
                    let nbRegionsWithStats = res.length - 1;
                    return {
                        date,
                        value: Number(Math.round((value / nbRegionsWithStats) + 'e0') + 'e-0'),
                    };
                });
            } else {
                acc[key] = national[key];
            }

            return acc;
        }, {}),
    };
};
