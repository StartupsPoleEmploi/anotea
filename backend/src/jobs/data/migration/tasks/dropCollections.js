module.exports = db => {

    return Promise.all([
        db.collection('kairos').drop().catch(() => ({})),
        db.collection('domainMailStats').drop().catch(() => ({})),
        db.collection('sessions').drop().catch(() => ({})),
        db.collection('contactStagiaires').drop().catch(() => ({})),
    ]);
};
