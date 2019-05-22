module.exports = (db, codeRegion) => {

    return db.collection('accounts').updateMany(
        { profile: 'organisme', codeRegion: codeRegion },
        {
            $set: {
                'meta.kairos.eligible': true,
            }
        }
    );
};
