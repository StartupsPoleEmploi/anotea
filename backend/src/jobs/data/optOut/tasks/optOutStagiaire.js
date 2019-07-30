const md5 = require('md5');

module.exports = async (db, email) => {

    let trainee = await db.collection('trainee').findOne({ 'trainee.email': email });
    return Promise.all([
        db.collection('trainee').removeOne({ token: trainee.token }),
        db.collection('comment').removeOne({ token: trainee.token }),
        db.collection('optOut').insertOne({
            md5: md5(email),
            date: new Date()
        })
    ]);
};
