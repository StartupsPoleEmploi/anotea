module.exports = db => {
    return Promise.all([
        db.collection('mailStats').drop().catch(() => ({})),
        db.collection('mailStatsByCodeFinanceur').drop().catch(() => ({})),
        db.collection('organismesStats').drop().catch(() => ({})),
        db.collection('sessionsStats').drop().catch(() => ({})),
    ]);
};

