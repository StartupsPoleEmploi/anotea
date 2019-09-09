const md5 = require('md5');

module.exports = async (db, email) => {

    let doc = await db.collection('trainee').findOne({ 'trainee.email': email });

    if (!doc) {
        throw new Error(`Unable to find stagiaires ${email}`);
    }

    let [trainee, comment, optOut] = await Promise.all([
        db.collection('trainee').removeOne({ token: doc.token }),
        db.collection('comment').removeOne({ token: doc.token }),
        db.collection('optOut').insertOne({ md5: md5(email), date: new Date() })
    ]);

    return {
        trainee: trainee.result.n,
        comment: comment.result.n,
        optOut: optOut.result.n,
    };
};
