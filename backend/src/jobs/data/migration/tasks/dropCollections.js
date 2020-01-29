module.exports = async db => {

    await Promise.all([
        db.collection('kairos').drop().catch(() => ({})),
        db.collection('domainMailStats').drop().catch(() => ({})),
        db.collection('sessions').drop().catch(() => ({})),
        db.collection('contactStagiaires').drop().catch(() => ({})),
    ]);

    return { dropped: true };
};
