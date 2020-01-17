const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newComment } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/components/fake-logger');
const importStagiaires = require('../../../../../src/jobs/import/stagiaires/tasks/importStagiaires');
const refreshStagiaires = require('../../../../../src/jobs/import/stagiaires/tasks/refreshStagiaires');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/poleEmploiCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getComponents, getTestFile, insertIntoDatabase }) => {

    it('should update data in stagiaire', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        let previous = await db.collection('stagiaires').findOne({ 'trainee.email': 'email_1@pe.com' });

        let stats = await refreshStagiaires(db, logger, getTestFile('stagiaires-pe-refreshed.csv'), handler);

        let next = await db.collection('stagiaires').findOne({ 'trainee.email': 'email_1@pe.com' });
        assert.deepStrictEqual(_.omit(next, ['meta']), _.merge(_.omit(previous, ['meta']), {
            trainee: {
                dnIndividuNational: 'AAAAAAA',
                idLocal: '0000000000Z',
            },
            training: {
                formacodes: ['99999'],
                certifInfos: ['99999'],
                organisation: {
                    id: '14000000000000008098',
                    label: 'ANOTEA FORMATION (SARL)',
                    name: 'ANOTEA ACCES FORMATION (SARL)',
                    siret: '82436343601239',
                },
                place: {
                    inseeCode: '91999',
                }
            }
        }));

        assert.deepStrictEqual(stats, {
            stagiaires: 1,
            comment: 0,
            invalid: 0,
            total: 2
        });
    });

    it('should store refresh status', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        await db.collection('stagiaires').updateMany({}, {
            $push: {
                'meta.history': { value: 'something changed' }
            }
        });

        await refreshStagiaires(db, logger, getTestFile('stagiaires-pe-refreshed.csv'), handler);

        let next = await db.collection('stagiaires').findOne({ 'trainee.email': 'email_1@pe.com' });
        assert.deepStrictEqual(next.meta.history.length, 2);
        assert.ok(next.meta.history[0].date);
        assert.deepStrictEqual(_.omit(next.meta.history[0], ['date']), {
            trainee: {
                dnIndividuNational: '1111111111',
                idLocal: '0167942369Z',
            },
            training: {
                certifInfos: {
                    '0': '8122',
                },
                formacodes: {
                    '0': '31734',
                },
                organisation: {
                    siret: '82436343601230',
                    label: 'ANOTEA FORMATION',
                    name: 'ANOTEA ACCES FORMATION'
                },
                place: {
                    inseeCode: '91521'
                }
            }
        });
        assert.deepStrictEqual(next.meta.history[1], {
            value: 'something changed'
        });
    });

    it('should ignore missing inseeCode', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), handler);

        await refreshStagiaires(db, logger, getTestFile('stagiaires-pe-refreshed.csv'), handler);

        let next = await db.collection('stagiaires').findOne({ 'trainee.email': 'email_2@pe.com' });
        assert.strictEqual(next.training.place.inseeCode, '91521');
    });

    it('should update data in comment', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        let stagiaire = await db.collection('stagiaires').findOne({ 'trainee.email': 'email_1@pe.com' });
        let previous = newComment({
            token: stagiaire.token,
        });
        await insertIntoDatabase('comment', previous);

        let stats = await refreshStagiaires(db, logger, getTestFile('stagiaires-pe-refreshed.csv'), handler);

        let next = await db.collection('comment').findOne({ token: stagiaire.token });
        assert.deepStrictEqual(_.omit(next, ['meta']), _.merge(_.omit(previous, ['meta']), {
            training: {
                formacodes: ['99999'],
                certifInfos: ['99999'],
                organisation: {
                    id: '14000000000000008098',
                    label: 'ANOTEA FORMATION (SARL)',
                    name: 'ANOTEA ACCES FORMATION (SARL)',
                    siret: '82436343601239',
                },
                place: {
                    inseeCode: '91999',
                }
            }
        }));

        assert.deepStrictEqual(next.meta.history.length, 1);
        let history = next.meta.history[0];
        assert.ok(history.date);
        assert.deepStrictEqual(_.omit(history, ['date']), {
            training: {
                certifInfos: {
                    '0': '78997',
                },
                formacodes: {
                    '0': '46242',
                },
                organisation: {
                    id: '14_OF_XXXXXXXXXX',
                    siret: '11111111111111',
                    label: 'Pole Emploi Formation',
                    name: 'INSTITUT DE FORMATION'
                },
                place: {
                    inseeCode: null
                }
            }
        });
        assert.deepStrictEqual(stats, {
            stagiaires: 1,
            comment: 1,
            invalid: 0,
            total: 2,
        });
    });
}));
