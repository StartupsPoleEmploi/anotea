const assert = require('assert');
const { withMongoDB } = require('../../../helpers/test-database');
const { newTrainee } = require('../../../helpers/data/dataset');
const patchOrganismeResponsable = require('../../../../src/jobs/patch/stagiaires/tasks/patchOrganismeResponsable');
const logger = require('../../../helpers/test-logger');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should update siret when organisme formateur can be found', async () => {

        let db = await getTestDatabase();

        await Promise.all([
            db.collection('intercarif_organismes_responsables').insertOne({
                _id: '11111111111111',
                siret: '11111111111111',
                nom: 'Organisme Responsable',
                raison_sociale: 'Organisme Responsable',
                organisme_formateurs: [
                    {
                        siret: '22222222222222',
                        raison_sociale: 'Organisme Formateur',
                        lieux_de_formation: [
                            {
                                nom: 'CENTRE Paris',
                                adresse: {
                                    code_postal: '75011',
                                    ville: 'Paris',
                                    region: '11'
                                }
                            },
                        ]
                    },
                ]
            }),
            insertIntoDatabase('trainee', newTrainee({
                _id: '1234',
                training: {
                    organisation: {
                        siret: '11111111111111',
                        label: 'Organisme Responsable label',
                        name: 'Organisme Responsable name'
                    },
                    place: {
                        postalCode: '75011',
                    },
                }
            }))
        ]);

        let stats = await patchOrganismeResponsable(db, logger);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.organisation.siret, '22222222222222');
        assert.deepStrictEqual(avis.training.organisation.label, 'Organisme Responsable label');
        assert.deepStrictEqual(avis.training.organisation.name, 'Organisme Formateur');
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
            db.collection('intercarif_organismes_responsables').insertOne({
                _id: '11111111111111',
                siret: '11111111111111',
                nom: 'PE Formation',
                raison_sociale: 'Pole Emploi Formation',
                organisme_formateurs: [
                    {
                        siret: '22222222222222',
                        raison_sociale: 'PE Formation',
                        lieux_de_formation: [
                            {
                                nom: 'CENTRE Orleans',
                                adresse: {
                                    code_postal: '45000',
                                    ville: 'Orleans',
                                    region: '17'
                                }
                            },
                        ]
                    },
                ]
            }),
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
            db.collection('intercarif_organismes_responsables').insertOne({
                _id: '11111111111111',
                siret: '11111111111111',
                nom: 'PE Formation',
                raison_sociale: 'Pole Emploi Formation',
                organisme_formateurs: [
                    {
                        siret: '11111111111111',
                        raison_sociale: 'PE Formation',
                        lieux_de_formation: [
                            {
                                nom: 'CENTRE Orleans',
                                adresse: {
                                    code_postal: '45000',
                                    ville: 'Orleans',
                                    region: '17'
                                }
                            },
                        ]
                    },
                ]
            }),
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
            db.collection('intercarif_organismes_responsables').insertOne({
                _id: '33333333333333',
                siret: '33333333333333',
                organisme_formateurs: [
                    {
                        siret: '22222222222222',
                        raison_sociale: 'PE Formation',
                        lieux_de_formation: [
                            {
                                nom: 'CENTRE Paris',
                                adresse: {
                                    code_postal: '75011',
                                    ville: 'Paris',
                                    region: '11'
                                }
                            },
                        ]
                    },
                ]
            }),
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
