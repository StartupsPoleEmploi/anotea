module.exports = async db => {

    let cursor = await db.collection('comment').find();
    let stats = {
        updated: 0,
        total: await cursor.count(),
    };

    //Sync comment.training --> trainee.training
    while (await cursor.hasNext()) {
        let comment = await cursor.next();

        let trainee = await db.collection('trainee').findOne({ token: comment.token });
        if (trainee && JSON.stringify(trainee.training) !== JSON.stringify(comment.training)) {

            await db.collection('trainee').updateOne(
                { _id: trainee._id },
                {
                    $set: {
                        'training.title': comment.training.title,
                        ...(comment.meta && comment.meta.patch && comment.meta.patch.certifInfo ?
                            {
                                'training.certifInfo.id': comment.training.certifInfo.id,
                                'meta.patch.certifInfo': comment.meta.patch.certifInfo
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

    return stats;
};
