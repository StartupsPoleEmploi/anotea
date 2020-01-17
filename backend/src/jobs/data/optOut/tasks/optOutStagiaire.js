const md5 = require('md5');

module.exports = async (db, email) => {

    let doc = await db.collection('stagiaires').findOne({ 'personal.email': email });

    if (!doc) {
        throw new Error(`Unable to find stagiaires ${email}`);
    }

    let [stagiaire, comment, optOut] = await Promise.all([
        db.collection('stagiaires').removeOne({ token: doc.token }),
        db.collection('comment').removeOne({ token: doc.token }),
        db.collection('optOut').insertOne({ md5: md5(email), date: new Date() })
    ]);

    return {
        stagiaire: stagiaire.result.n,
        comment: comment.result.n,
        optOut: optOut.result.n,
    };
};
