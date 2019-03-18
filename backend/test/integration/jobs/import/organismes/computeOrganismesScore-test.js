const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newOrganismeAccount, newModerateurAccount, newComment } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/test-logger');
const computeOrganismesScore = require('../../../../../src/jobs/import/organismes/computeOrganismesScore');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    const prepareDatabase = () => {
        return Promise.all([
            ...(
                _.range(1).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        training: {
                            organisation: {
                                siret: '11111111111111',
                            },
                        }
                    }));
                })
            ),
            ...(
                _.range(2).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        training: {
                            organisation: {
                                siret: '22222222222222',
                            },
                        }
                    }));
                })
            ),
        ]);
    };

    it('should compute score', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            prepareDatabase(),
            insertIntoDatabase('accounts', _.omit(newOrganismeAccount({
                _id: 22222222222222,
                SIRET: 22222222222222,
                meta: {
                    siretAsString: '22222222222222'
                },
            }), ['score'])),
        ]);

        let stats = await computeOrganismesScore(db, logger);

        let doc = await db.collection('accounts').findOne({ SIRET: 22222222222222 });
        assert.deepStrictEqual(stats, {
            total: 1,
            updated: 1,
            invalid: 0,
        });
        assert.deepStrictEqual(doc.score, {
            nb_avis: 2,
            notes: {
                accompagnement: 1,
                accueil: 3,
                contenu_formation: 2,
                equipe_formateurs: 4,
                moyen_materiel: 2,
                global: 2,
            }
        });
    });

    it('should not compute score for moderateur', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            prepareDatabase(),
            insertIntoDatabase('accounts', newModerateurAccount({
                courriel: 'admin@pole-emploi.fr',
            })),
        ]);

        await computeOrganismesScore(db, logger);

        let doc = await db.collection('accounts').findOne({ courriel: 'admin@pole-emploi.fr' });
        assert.deepStrictEqual(doc.score, undefined);
    });


    it('should use rejected avis to compute score', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            prepareDatabase(),
            insertIntoDatabase('accounts', _.omit(newOrganismeAccount({
                _id: 22222222222222,
                SIRET: 22222222222222,
                meta: {
                    siretAsString: '22222222222222'
                },
            })), ['score']),
            insertIntoDatabase('comment', newComment({
                rejected: true,
                rates: {
                    accueil: 0,
                    contenu_formation: 0,
                    equipe_formateurs: 0,
                    moyen_materiel: 0,
                    accompagnement: 0,
                    global: 0
                },
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            })),
        ]);

        await computeOrganismesScore(db, logger);

        let doc = await db.collection('accounts').findOne({ SIRET: 22222222222222 });
        assert.deepStrictEqual(doc.score, {
            nb_avis: 3,
            notes: {
                accompagnement: 1,
                accueil: 2,
                contenu_formation: 2,
                equipe_formateurs: 3,
                moyen_materiel: 2,
                global: 2,
            }
        });
    });

    it('should give default score when no comments', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            prepareDatabase(),
            insertIntoDatabase('accounts', _.omit(newOrganismeAccount({
                _id: 44444444444444,
                SIRET: 44444444444444,
                meta: {
                    siretAsString: '44444444444444'
                },
            })), ['score']),
        ]);

        await computeOrganismesScore(db, logger);

        let doc = await db.collection('accounts').findOne({ SIRET: 44444444444444 });
        assert.deepStrictEqual(doc.score, {
            nb_avis: 0,
        });
    });
}));
