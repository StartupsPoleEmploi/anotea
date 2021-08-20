const moment = require('moment');

module.exports = async (db, logger, filters = {}) => {

    await db.collection('stagiaires').updateMany({
        'formation.action.session.nbStagiaires': null
    }, {
        $set: { 'formation.action.session.nbStagiaires': 0 }
    });

    let cursor;
    if (filters.all) {
        cursor = db.collection('stagiaires').find({
            'formation.action.session.nbStagiaires': { $lt: 5 },
            'sourceIDF': null,
        });
    } else {
        cursor = db.collection('stagiaires').find({
            'formation.action.session.nbStagiaires': { $lt: 5 },
            'sourceIDF': null,
            'avisCreated': false,
            'unsubscribe': false,
            'formation.action.organisme_formateur.siret': { $ne: '' },
            '$and': [
                { 'formation.action.session.periode.fin': { $lte: new Date() } },
                { 'formation.action.session.periode.fin': { $gte: moment().subtract(12, 'months').toDate() } },
            ] },
        );
    }
    
    while (await cursor.hasNext()) {
        let stagiaire = await cursor.next();
        try {
            await db.collection('stagiaires').updateMany({
                'formation.action.session.id': stagiaire.formation.action.session.id
            }, {
                $set: {
                    'formation.action.session.nbStagiaires': await db.collection('stagiaires').find({
                        'formation.action.session.id': stagiaire.formation.action.session.id
                    }).count()
                }
            });
        } catch (err) {
            logger.error(err);
        }
    }


    await db.collection('jobs').insertOne({
        type: 'count-stagiaires',
        filters,
        date: new Date(),
    });

    return {};
};
