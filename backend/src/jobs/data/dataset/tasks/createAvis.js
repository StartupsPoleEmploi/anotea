const { batchCursor } = require('../../../job-utils');
const moment = require('moment');
const _ = require('lodash');
const faker = require('faker');

faker.locale = 'fr';

const buildAvis = (stagiaire, custom = {}) => {

    let getDateInThePast = () => moment().subtract('100', 'days').toDate();

    return _.merge({
        token: stagiaire.token,
        campaign: 'dataset',
        read: false,
        codeRegion: stagiaire.codeRegion,
        training: stagiaire.training,
        rates: {
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            accompagnement: 1,
            global: 2.1,
        },
        date: getDateInThePast(),
    }, custom);
};

module.exports = async (db, options) => {

    let generateAvis = async (nbElements, getCustom = () => ({})) => {
        let cursor = await db.collection('stagiaires').find({ avisCreated: false }).limit(nbElements);

        return batchCursor(cursor, async next => {
            let stagiaire = await next();

            //TODO add a service to create avis
            let avis = buildAvis(stagiaire, getCustom());
            await Promise.all([
                db.collection('stagiaires').updateOne({ token: stagiaire.token }, { $set: { avisCreated: true } }),
                db.collection('avis').insertOne(avis),
            ]);
        });
    };

    await generateAvis(options.notes || 100, () => ({ status: 'validated' }));
    await generateAvis(options.commentaires || 100, () => {
        return {
            //Must be reused from questionnaire-routes
            status: 'none',
            commentaire: {
                title: faker.lorem.sentence(),
                text: faker.lorem.paragraph(),
                titleMasked: false,
            }
        };
    });
};
