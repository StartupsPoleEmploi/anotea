module.exports = async (db, collectionName, regions) => {
    let promises = [];
    let cursor = db.collection(collectionName).find({});
    while (await cursor.hasNext()) {
        const document = await cursor.next();
        let codeRegion = regions.findRegionByCodeINSEE(document.region).codeRegion;
        promises.push(db.collection(collectionName).updateOne({ _id: document._id }, {
            $set: {
                'code_region': codeRegion,
            },

        }));
    }
    return Promise.all(promises);
};
