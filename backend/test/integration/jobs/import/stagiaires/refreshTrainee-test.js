const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newComment } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/test-logger');
const importTrainee = require('../../../../../src/jobs/import/stagiaires/tasks/importTrainee');
const refreshTrainee = require('../../../../../src/jobs/import/stagiaires/tasks/refreshTrainee');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/poleEmploiCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getComponents, getTestFile, insertIntoDatabase }) => {

    it('should update inseeCode in trainee', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);

        let stats = await refreshTrainee(db, logger, getTestFile('stagiaires-pe-updated.csv'), handler);

        let next = await db.collection('trainee').findOne({ 'trainee.email': 'email_1@pe.com' });
        let previous = await db.collection('trainee').findOne({ 'trainee.email': 'email_1@pe.com' });
        assert.deepStrictEqual(_.omit(next, ['meta']), _.merge(_.omit(previous, ['meta']), {
            training: {
                organisation: {
                    id: '14000000000000008098',
                    label: 'ANOTEA FORMATION (SARL)',
                    name: 'ANOTEA ACCES FORMATION (SARL)',
                    siret: '82436343601239',
                },
                place: {
                    inseeCode: '99999',
                }
            }
        }));

        assert.deepStrictEqual(next.meta.refreshed.length, 1);
        let refreshed = next.meta.refreshed[0];
        assert.ok(refreshed.date);
        assert.deepStrictEqual(_.omit(refreshed, ['date']), {
            diff: {
                training: {
                    organisation: {
                        siret: '82436343601230',
                        label: 'ANOTEA FORMATION',
                        name: 'ANOTEA ACCES FORMATION'
                    },
                    place: {
                        inseeCode: '91521'
                    }
                }
            }
        });
        assert.deepStrictEqual(stats, {
            trainee: 1,
            comment: 0,
            invalid: 0,
            total: 1
        });
    });

    it('should update inseeCode in comment', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        let trainee = await db.collection('trainee').findOne({ 'trainee.email': 'email_1@pe.com' });
        let previous = newComment({
            token: trainee.token,
        });
        await insertIntoDatabase('comment', previous);

        let stats = await refreshTrainee(db, logger, getTestFile('stagiaires-pe-updated.csv'), handler);

        let next = await db.collection('comment').findOne({ token: trainee.token });
        assert.deepStrictEqual(next.training.organisation, {
            id: '14000000000000008098',
            label: 'ANOTEA FORMATION (SARL)',
            name: 'ANOTEA ACCES FORMATION (SARL)',
            siret: '82436343601239',
        });
        assert.deepStrictEqual(next.training.place.inseeCode, '99999');
        assert.deepStrictEqual(next.meta.refreshed.length, 1);
        let refreshed = next.meta.refreshed[0];
        assert.ok(refreshed.date);
        assert.deepStrictEqual(_.omit(refreshed, ['date']), {
            diff: {
                training: {
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
            }
        });
        assert.deepStrictEqual(stats, {
            trainee: 1,
            comment: 1,
            invalid: 0,
            total: 1
        });
    });
}));
