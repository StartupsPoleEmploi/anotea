const faker = require('faker');

module.exports = async (db, moderation, consultation) => {

    let makeAction = async (nbElements, selector, action) => {
        let cursor = await db.collection('comment').find(selector).limit(nbElements);
        while (await cursor.hasNext()) {
            let avis = await cursor.next();
            await action(avis);
        }
    };

    await makeAction(50, { comment: { $exists: true }, published: false }, avis => moderation.publish(avis._id, 'positif'));
    await makeAction(10, { comment: { $exists: true }, published: false }, avis => moderation.reject(avis._id, 'alerte'));
    await makeAction(10, { comment: { $exists: true }, published: true }, avis => consultation.report(avis._id, true));
    await makeAction(10, { comment: { $exists: true }, published: true }, avis => {
        return consultation.addReponse(avis._id, faker.lorem.paragraph());
    });
};
