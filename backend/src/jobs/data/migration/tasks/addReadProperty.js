const moment = require('moment');

module.exports = async db => {
    let [markCommentairesAsNotRead, markOldNotesAsRead, markNewNotesAsNotRead] = await Promise.all([
        db.collection('comment').updateMany(
            { 'comment': { $exists: true }, 'read': { $ne: true } },
            { $set: { read: false } }
        ),
        db.collection('comment').updateMany(
            { 'comment': { $exists: false }, 'read': { $ne: true }, 'date': { $lt: moment('2019-09-01 00Z').toDate() } },
            { $set: { read: true } }
        ),
        db.collection('comment').updateMany(
            { 'comment': { $exists: false }, 'read': { $ne: true }, 'date': { $gte: moment('2019-09-01 00Z').toDate() } },
            { $set: { read: false } }
        ),
    ]);

    return { markCommentairesAsNotRead, markOldNotesAsRead, markNewNotesAsNotRead };
};
