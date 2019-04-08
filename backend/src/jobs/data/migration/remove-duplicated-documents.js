module.exports = async (db, logger, collectionName) => {
    let cursor = db.collection(collectionName).aggregate([
        {
            $group: {
                _id: '$token',
                total: { $sum: 1 },
                avis: { $first: '$$ROOT' }
            }
        },
        {
            $match: {
                total: { $gt: 1 }
            }
        }
    ], { allowDiskUse: true });

    let removed = 0;
    while (await cursor.hasNext()) {
        let { document } = await cursor.next();
        logger.info(`Removing duplicated ${collectionName} ${document.token}`);

        removed++;
        try {
            await db.collection(collectionName).removeMany({ token: document.token });
            await db.collection(collectionName).insertOne(document);
        } catch (err) {
            logger.error(err);
        }
    }

    return { removed };
};
