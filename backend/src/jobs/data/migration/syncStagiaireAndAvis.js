module.exports = async db => {

    let cursor = await db.collection('comment').find();
    let stats = {
        updated: 0,
        total: await cursor.count(),
    };
    while (await cursor.hasNext()) {
        let comment = await cursor.next();

        //Sync training property from comment to trainee
        let trainee = await db.collection('trainee').findOne({ token: comment.token });
        if (trainee && JSON.stringify(trainee.training) !== JSON.stringify(comment.training)) {

            await db.collection('trainee').updateOne(
                { _id: trainee._id },
                {
                    $set: {
                        'training.title': comment.training.title,
                        ...(comment.meta && comment.meta.originalCertifInfo ?
                            {
                                'training.certifInfo.id': comment.training.certifInfo.id,
                                'meta.patch.certifInfo': comment.meta.originalCertifInfo
                            } : {}),
                        ...(trainee.training.organisation.label !== comment.training.organisation.label ?
                            {
                                'training.organisation.label': comment.training.organisation.label,
                            } : {}),
                        ...(trainee.training.organisation.name !== comment.training.organisation.name ?
                            {
                                'training.organisation.name': comment.training.organisation.name,
                            } : {}),
                    },
                },
                { upsert: false }
            );
            stats.updated++;
        }
    }

    //Rename originalCertifInfo property
    await db.collection('comment').updateOne(
        {},
        { $rename: { 'meta.originalCertifInfo': 'meta.patch.certifInfo' } },
        { upsert: false },
    );

    return stats;
};
