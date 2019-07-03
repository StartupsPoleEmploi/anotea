const assert = require('assert');
const { withMongoDB } = require('../../../helpers/test-database');
const { newTrainee } = require('../../../helpers/data/dataset');
const patchOrganismeResponsable = require('../../../../src/jobs/patch/stagiaires/tasks/patchOrganismeResponsable');
const logger = require('../../../helpers/test-logger');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    it('should update siret when organisme formateur can be found', async () => {

        let db = await getTestDatabase();

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('trainee', newTrainee({
                _id: '1234',
                training: {
                    organisation: {
                        siret: '11111111111111',
                        label: 'Organisme Responsable label',
                        name: 'Organisme Responsable name'
                    },
                    place: {
                        postalCode: '75019',
                    },
                }
            }))
        ]);

        let stats = await patchOrganismeResponsable(db, logger);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.organisation.siret, '22222222222222');
        assert.deepStrictEqual(avis.training.organisation.label, 'Organisme Responsable label');
        assert.deepStrictEqual(avis.training.organisation.name, 'Anotea Formation Paris');
        assert.deepStrictEqual(avis.meta.patch.organisation.siret, '11111111111111');
        assert.deepStrictEqual(avis.meta.patch.organisation.name, 'Organisme Responsable name');
        assert.deepStrictEqual(stats, {
            updated: 1,
            invalid: 0,
            total: 1,
        });
    });

    it('should not update when organisme formateur does not exist', async () => {

        let db = await getTestDatabase();

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('trainee', newTrainee({
                _id: '1234',
                training: {
                    organisation: {
                        siret: '11111111111111',
                    },
                    place: {
                        postalCode: '75011',
                    },
                }
            }))
        ]);

        let stats = await patchOrganismeResponsable(db, logger);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.organisation.siret, '11111111111111');
        assert.deepStrictEqual(avis.training.meta, undefined);
        assert.deepStrictEqual(stats, {
            updated: 0,
            invalid: 0,
            total: 0,
        });
    });

    it('should not update when organisme formateur is the same as the organisme responsable', async () => {

        let db = await getTestDatabase();

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('trainee', newTrainee({
                _id: '1234',
                training: {
                    organisation: {
                        siret: '11111111111111',
                    },
                    place: {
                        postalCode: '75011',
                    },
                }
            }))
        ]);

        let stats = await patchOrganismeResponsable(db, logger);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.meta, undefined);
        assert.deepStrictEqual(stats, {
            updated: 0,
            invalid: 0,
            total: 0,
        });
    });

    it('should not update siret when organisme responsable does not exist', async () => {

        let db = await getTestDatabase();

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('trainee', newTrainee({
                _id: '1234',
                training: {
                    organisation: {
                        siret: '11111111111111',
                    },
                    place: {
                        postalCode: '75011',
                    },
                }
            }))
        ]);

        let stats = await patchOrganismeResponsable(db, logger);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.organisation.siret, '11111111111111');
        assert.deepStrictEqual(avis.training.meta, undefined);
        assert.deepStrictEqual(stats, {
            updated: 0,
            invalid: 0,
            total: 0,
        });
    });

}));
