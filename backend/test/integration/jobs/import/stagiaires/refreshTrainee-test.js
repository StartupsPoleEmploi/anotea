const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newComment } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/components/fake-logger');
const importTrainee = require('../../../../../src/jobs/import/stagiaires/tasks/importTrainee');
const refreshTrainee = require('../../../../../src/jobs/import/stagiaires/tasks/refreshTrainee');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/poleEmploiCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getComponents, getTestFile, insertIntoDatabase }) => {

    it('should update data in trainee', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        let previous = await db.collection('trainee').findOne({ 'trainee.email': 'email_1@pe.com' });

        let stats = await refreshTrainee(db, logger, getTestFile('stagiaires-pe-refreshed.csv'), handler);

        let next = await db.collection('trainee').findOne({ 'trainee.email': 'email_1@pe.com' });
        assert.deepStrictEqual(_.omit(next, ['meta']), _.merge(_.omit(previous, ['meta']), {
            training: {
                formacodes: ['31734', '99999'],
                certifInfos: ['8122', '99999'],
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
            trainee: 1,
            comment: 0,
            invalid: 0,
            total: 2
        });
    });

    it('should store refresh status', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        await db.collection('trainee').updateMany({}, {
            $push: {
                'meta.history': { value: 'something changed' }
            }
        });

        await refreshTrainee(db, logger, getTestFile('stagiaires-pe-refreshed.csv'), handler);

        let next = await db.collection('trainee').findOne({ 'trainee.email': 'email_1@pe.com' });
        assert.deepStrictEqual(next.meta.history.length, 2);
        assert.ok(next.meta.history[0].date);
        assert.deepStrictEqual(_.omit(next.meta.history[0], ['date']), {
            training: {
                certifInfos: {
                    '1': null,
                },
                formacodes: {
                    '1': null,
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
        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);

        await refreshTrainee(db, logger, getTestFile('stagiaires-pe-refreshed.csv'), handler);

        let next = await db.collection('trainee').findOne({ 'trainee.email': 'email_2@pe.com' });
        assert.strictEqual(next.training.place.inseeCode, '91521');
    });

    it('should update data in comment', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        let trainee = await db.collection('trainee').findOne({ 'trainee.email': 'email_1@pe.com' });
        let previous = newComment({
            token: trainee.token,
        });
        await insertIntoDatabase('comment', previous);

        let stats = await refreshTrainee(db, logger, getTestFile('stagiaires-pe-refreshed.csv'), handler);

        let next = await db.collection('comment').findOne({ token: trainee.token });
        assert.deepStrictEqual(_.omit(next, ['meta']), _.merge(_.omit(previous, ['meta']), {
            training: {
                formacodes: ['46242', '99999'],
                certifInfos: ['78997', '99999'],
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
                    '1': null,
                },
                formacodes: {
                    '1': null,
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
            trainee: 1,
            comment: 1,
            invalid: 0,
            total: 2,
        });
    });
}));
