const moment = require('moment/moment');

module.exports = (db, retention = moment().subtract(1, 'hours').toDate()) => {

    let query = {
        $or: [
            { 'meta.import_date': { $lte: retention } },
            { 'meta.import_date': { $exists: false } },
        ]
    };

    return Promise.all([
        db.collection('sessionsReconciliees').deleteMany(query),
        db.collection('actionsReconciliees').deleteMany(query),
        db.collection('formationsReconciliees').deleteMany(query),
    ]);
};
