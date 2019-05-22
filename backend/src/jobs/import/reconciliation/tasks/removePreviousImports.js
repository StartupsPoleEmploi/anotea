const moment = require('moment/moment');

module.exports = (db, retention) => {

    let query = {
        $or: [
            { 'meta.import_date': { $lte: retention || moment().subtract(12, 'hours').toDate() } },
            { 'meta.import_date': { $exists: false } },
        ]
    };

    return Promise.all([
        db.collection('sessionsReconciliees').removeMany(query),
        db.collection('actionsReconciliees').removeMany(query),
        db.collection('formationsReconciliees').removeMany(query),
    ]);
};
