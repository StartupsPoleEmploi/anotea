const moment = require("moment/moment");

module.exports = (db, retention = moment().subtract(12, "hours").toDate()) => {

    let query = {
        $or: [
            { "meta.import_date": { $lte: retention } },
            { "meta.import_date": { $exists: false } },
        ]
    };

    return Promise.all([
        db.collection("sessionsReconciliees").removeMany(query),
        db.collection("actionsReconciliees").removeMany(query),
        db.collection("formationsReconciliees").removeMany(query),
    ]);
};
