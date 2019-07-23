module.exports = db => {
    return Promise.all([
        db.collection('archivedComment').drop().catch(() => ({})),
        db.collection('archivedCommentISMI').drop().catch(() => ({})),
        db.collection('archivedAdvices').drop().catch(() => ({})),
        db.collection('archivedTrainee').drop().catch(() => ({})),
    ]);
};
