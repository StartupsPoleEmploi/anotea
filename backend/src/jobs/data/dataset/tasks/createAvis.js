const { batchCursor } = require('../../../job-utils');
const moment = require('moment');
const _ = require('lodash');
const faker = require('faker');
const uuid = require('uuid');

faker.locale = 'fr';

const buildAvis = (stagiaire, custom = {}) => {

    let randomize = value => `${value}-${uuid.v4()}`;
    let getDateInThePast = () => moment().subtract('100', 'days').toDate();

    return _.merge({
        token: randomize('token'),
        campaign: 'dataset',
        archived: false,
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
        let cursor = await db.collection('trainee').find({ avisCreated: false }).limit(nbElements);

        return batchCursor(cursor, async next => {
            let stagiaire = await next();

            let avis = buildAvis(stagiaire, getCustom());
            await Promise.all([
                db.collection('trainee').updateOne({ _id: stagiaire._id }, { $set: { avisCreated: true } }),
                db.collection('comment').insertOne(avis),
            ]);
        });
    };

    return Promise.all([
        generateAvis(options.notes || 100),
        generateAvis(options.commentaires || 100, () => {
            return {
                //Must be reused from questionnaire-routes
                published: false,
                rejected: false,
                reported: false,
                moderated: false,
                comment: {
                    title: faker.lorem.sentence(),
                    text: faker.lorem.paragraph(),
                }
            };
        }),
    ]);

};
