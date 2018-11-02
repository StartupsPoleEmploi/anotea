module.exports = db => ({
    findCodeRegionByPostalCode: async postalCode => {
        let departement = postalCode.substr(0, 2) !== '97' ? postalCode.substr(0, 2) : postalCode.substr(0, 3);

        let region = await db.collection('regions')
        .findOne({
            dept_num: `${parseInt(departement, 10)}`,
        });
        if (region === null) {
            return Promise.reject(new Error(`Code region inconnu pour le departement ${departement}`));
        } else {
            return region.region_num;
        }
    },
    findCodeRegionByName: async name => {

        let results = await db.collection('regions')
        .find({ $text: { $search: name } }, { score: { $meta: 'textScore' } })
        .project({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(1)
        .toArray();

        let region = results[0];
        if (region === null) {
            let regionName = name.split(' ').join('-');
            return Promise.reject(new Error(`Nom de region inconnu: ${regionName}`));
        } else {
            return region.region_num;
        }
    },
    findDepartementsForRegion: async code => {
        let regions = await db.collection('regions')
        .find({ region_num: code })
        .toArray();

        let list = regions.map(region => {
            return `${parseInt(region.dept_num, 10)}`;
        });

        return list;
    },
});
