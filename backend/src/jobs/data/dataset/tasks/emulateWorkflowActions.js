const faker = require('faker');

module.exports = async (db, workflow, options = {}) => {

    let makeAction = async (nbElements, selector, action) => {
        let cursor = await db.collection('avis').find(selector).limit(nbElements);
        while (await cursor.hasNext()) {
            let avis = await cursor.next();
            await action(avis);
        }
    };

    let nbModerationsActions = (options.commentaires || 100) / 5;
    await makeAction(nbModerationsActions, { status: 'none' }, avis => {
        return workflow.validate(avis._id, 'positif');
    });
    await makeAction(nbModerationsActions, { status: 'none' }, avis => {
        return workflow.reject(avis._id, 'alerte');
    });

    let nbCommentairesActions = nbModerationsActions / 5;
    await makeAction(nbCommentairesActions, { comment: { $exists: true }, status: 'validated' }, avis => {
        return workflow.report(avis._id, true);
    });
    await makeAction(nbCommentairesActions, { comment: { $exists: true }, status: 'validated' }, avis => {
        return workflow.addReponse(avis._id, faker.lorem.paragraph());
    });

    let nbReponsesActions = nbCommentairesActions / 5;
    await makeAction(nbReponsesActions, { 'reponse.status': 'none' }, avis => {
        return workflow.validateReponse(avis._id, true);
    });
    await makeAction(nbReponsesActions, { 'reponse.status': 'none' }, avis => {
        return workflow.rejectReponse(avis._id, faker.lorem.paragraph());
    });
};
