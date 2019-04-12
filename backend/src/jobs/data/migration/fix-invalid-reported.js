module.exports = async db => {
    let result = await db.collection('comment').updateMany({
        reported: true,
        $or: [{ published: true }, { rejected: true }]
    }, {
        $set: {
            reported: true,
            rejected: false,
            published: false,
        }
    });

    return { nbReportedAvisFixed: result || 0 };
};
