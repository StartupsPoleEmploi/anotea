module.exports = db => {
    return {
        findINSEECodeByINSEE: async insee => await db.collection('inseeCode').findOne({ insee: insee }),
        getAggregatedPlaces: async places => {
            let added = [];
            const promise = places.map(async place => {
                const inseeCity = await db.collection('inseeCode').findOne({
                    $or: [
                        { cedex: { $elemMatch: { $eq: place._id } } },
                        { postalCode: { $elemMatch: { $eq: place._id } } },
                        { insee: place._id },
                        { commune: place._id }
                    ]
                });
                if (inseeCity === null) {
                    place.city = place.city.toUpperCase() + ' - inconnue : ' + place._id;
                    place.codeINSEE = place._id;
                    return place;
                } else if (added[inseeCity.insee] !== true) {
                    added[inseeCity.insee] = true;
                    return { codeINSEE: inseeCity.insee, city: inseeCity.commune };
                }
            });

            return await Promise.all(promise);
        }
    };
};
