const faker = require('faker');

module.exports = async (db, moderation, consultation, options = {}) => {

    let makeAction = async (nbElements, selector, action) => {
        let cursor = await db.collection('comment').find(selector).limit(nbElements);
        while (await cursor.hasNext()) {
            let avis = await cursor.next();
            await action(avis);
        }
    };

    let nbModerationsActions = (options.commentaires || 100) / 5;
    await makeAction(nbModerationsActions, { status: 'none' }, avis => {
        return moderation.publish(avis._id, 'positif');
    });
    await makeAction(nbModerationsActions, { status: 'none' }, avis => {
        return moderation.reject(avis._id, 'alerte');
    });

    let nbCommentairesActions = nbModerationsActions / 5;
    await makeAction(nbCommentairesActions, { comment: { $exists: true }, status: 'validated' }, avis => {
        return consultation.report(avis._id, true);
    });
    await makeAction(nbCommentairesActions, { comment: { $exists: true }, status: 'validated' }, avis => {
        return consultation.addReponse(avis._id, faker.lorem.paragraph());
    });

    let nbReponsesActions = nbCommentairesActions / 5;
    await makeAction(nbReponsesActions, { 'reponse.status': 'none' }, avis => {
        return moderation.publishReponse(avis._id, true);
    });
    await makeAction(nbReponsesActions, { 'reponse.status': 'none' }, avis => {
        return moderation.rejectReponse(avis._id, faker.lorem.paragraph());
    });
};
