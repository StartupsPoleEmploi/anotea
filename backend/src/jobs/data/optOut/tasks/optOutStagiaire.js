const md5 = require('md5');

module.exports = async (db, email) => {

    let doc = await db.collection('stagiaires').findOne({ 'individu.email': email });

    if (!doc) {
        throw new Error(`Unable to find stagiaires ${email}`);
    }

    let [stagiaire, avis, optOut] = await Promise.all([
        db.collection('stagiaires').deleteOne({ token: doc.token }),
        db.collection('avis').deleteOne({ token: doc.token }),
        db.collection('optOut').insertOne({ md5: md5(email), date: new Date() })
    ]);

    return {
        stagiaire: stagiaire.deletedCount,
        avis: avis.deletedCount,
        optOut: optOut.acknowledged ? 1 : 0,
    };
};
