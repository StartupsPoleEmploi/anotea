module.exports = async db => {
    let collections = await db.listCollections().toArray();

    let results = await Promise.all(
        collections
        .filter(collection => collection.idIndex && collection.idIndex.ns.startsWith("anotea"))
        .map(async collection => {

            let name = collection.name;
            let results = await db.collection(name).aggregate([
                { $indexStats: {} },
                { $match: { "accesses.ops": { $lt: 1 } } },
            ]).toArray();

            let unused = results.filter(r => r.name !== "_id_").map(r => r.name);
            return { collection: name, unusedIndexes: unused };
        })
    );

    return results.filter(r => r.unusedIndexes.length > 0);
};
