const fs = require('fs');

module.exports = async (db, dumpFile) => {

    let projection = { 'pseudo': 1, 'comment': 1, 'training.title': 1, 'training.organisation.name': 1, '_id': 0 };
    let [published, rejected, reported, toModerate] = await Promise.all([

        db.collection('comment').find({ published: true }).project(projection).limit(5).toArray(),

        db.collection('comment').find({ rejected: true }).project(projection).limit(5).toArray(),

        db.collection('comment').find({ reported: true }).project(projection).limit(5).toArray(),

        db.collection('comment').find({ moderated: { $exists: false }, comment: { $exists: true } })
        .project(projection)
        .limit(100)
        .toArray(),

    ]);

    let avis = JSON.stringify({ published, rejected, reported, toModerate });
    return new Promise((resolve, reject) => {
        fs.writeFile(dumpFile, avis, 'utf8', err => {
            if (err) {
                return reject(err);
            }
            return resolve(dumpFile);
        });
    });
};
