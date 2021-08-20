const md5 = require('md5');
const _ = require('lodash');
const assert = require('assert');
const md5File = require('md5-file');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const logger = require('../../../../helpers/components/fake-logger');
const importStagiaires = require('../../../../../src/jobs/import/stagiaires/tasks/importStagiaires');
const countStagiaires = require('../../../../../src/jobs/import/stagiaires/tasks/countStagiaires');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/poleEmploiCSVHandler');
const ileDeFranceCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/ileDeFranceCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getComponents, getTestFile, insertIntoDatabase }) => {

    it.only('should import stagiaires from csv file', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();

        await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), poleEmploiCSVHandler(db, regions));
        const filters = { all: true };
        await countStagiaires(db, logger, filters);

        let count = await db.collection('stagiaires').countDocuments();
        assert.strictEqual(count, 4);
        let results = await db.collection('stagiaires').find({ 'individu.nom': 'MARTIN' }).toArray();
        assert.ok(results[0]._id);
        assert.ok(results[0].importDate);
        assert.ok(results[0].campaignDate);
        assert.ok(results[0].token);
        assert.deepStrictEqual(_.omit(results[0], ['_id', 'importDate', 'token', 'campaignDate']), {
            campaign: 'stagiaires-pe',
            avisCreated: false,
            unsubscribe: false,
            mailSent: false,
            codeRegion: '11',
            refreshKey: 'e75a9fb65e99ca2cbbeaa40164284744',
            dispositifFinancement: 'AIF',
            individu: {
                nom: 'MARTIN',
                prenom: 'EUGENE',
                email: 'email_1@pe.com',
                telephones: ['0611111111'],
                emailValid: true,
                identifiant_pe: '1111111111',
                identifiant_local: '0167942369Z'
            },
            formation: {
                numero: '14_AF_0000044465',
                intitule: 'Titre professionnel',
                domaine_formation: {
                    formacodes: ['31734'],
                },
                certifications: [{ certif_info: '8122' }],
                action: {
                    numero: '14_SE_0000160070',
                    lieu_de_formation: {
                        code_postal: '91130',
                        ville: 'Ris-Orangis',
                    },
                    organisme_financeurs: [
                        { code_financeur: '4' },
                        { code_financeur: '7' },
                    ],
                    organisme_formateur: {
                        raison_sociale: 'ANOTEA ACCES FORMATION',
                        label: 'ANOTEA FORMATION',
                        siret: '82436343601230',
                        numero: '14000000000000008098',
                    },
                    session: {
                        id: '3565575',
                        nbStagiaires: 4,
                        numero: 'SE_0000160070',
                        periode: {
                            debut: new Date('2018-05-22T00:00:00.000Z'),
                            fin: new Date('2018-08-24T00:00:00.000Z'),
                        },
                    },
                },
            },
        });
    });

    it('should fail to import stagiaire when codeRegion can not be found', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-invalid-departement.csv');
        let { regions } = await getComponents();

        let stats = await importStagiaires(db, logger, csvFile, poleEmploiCSVHandler(db, regions));
        assert.deepStrictEqual(stats, {
            invalid: 1,
            ignored: 0,
            imported: 0,
            total: 1,
        });
    });

    it('should ignore stagiaire with not active region (Occitanie)', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-inactive-region.csv');
        let { regions } = await getComponents();

        await importStagiaires(db, logger, csvFile, poleEmploiCSVHandler(db, regions));

        let count = await db.collection('stagiaires').countDocuments();
        assert.strictEqual(count, 0);
    });

    it('should ignore stagiaire already imported in another campaign', async () => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        let results = await importStagiaires(db, logger, getTestFile('stagiaires-pe-doublons.csv'), handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

    it('should handle inseeCode with letters (corse)', async () => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let results = await importStagiaires(db, logger, getTestFile('stagiaires-pe-corse.csv'), handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 0,
            imported: 1,
            total: 1,
        });
    });

    it('should handle multi formacodes and certifInfos', async () => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importStagiaires(db, logger, getTestFile('stagiaires-pe-multi-formacodes-certifinfos.csv'), handler);

        let doc = await db.collection('stagiaires').findOne();
        assert.ok(doc.individu);
        assert.deepStrictEqual(doc.formation.domaine_formation.formacodes, ['31734', '31735', '31736']);
        assert.deepStrictEqual(doc.formation.certifications.map(c => c.certif_info), ['8122', '8123', '8124']);
    });

    it('should ignore stagiaire already removed', async () => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();
        await insertIntoDatabase('optOut', { type: 'stagiaire', md5: md5('email_1@pe.com') });
        let handler = poleEmploiCSVHandler(db, regions);

        let results = await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 3,
            total: 4,
        });
    });

    it('should import stagiaires from CSV file (IDF)', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = ileDeFranceCSVHandler(db, regions);

        await importStagiaires(db, logger, getTestFile('stagiaires-idf.csv'), handler);

        let count = await db.collection('stagiaires').countDocuments();
        assert.strictEqual(count, 5);
        let docs = await db.collection('stagiaires').find({ 'individu.email': 'email1@pe.fr' }).toArray();
        assert.ok(docs[0]._id);
        assert.ok(docs[0].importDate);
        assert.ok(docs[0].campaignDate);
        assert.ok(docs[0].token);
        assert.deepStrictEqual(_.omit(docs[0], ['_id', 'importDate', 'token', 'campaignDate']), {
            campaign: 'stagiaires-idf',
            sourceIDF: true,
            avisCreated: false,
            unsubscribe: false,
            mailSent: false,
            codeRegion: '11',
            refreshKey: 'bc2ad42298cfacb72a29dea2f2230660',
            individu: {
                nom: 'MARTIN',
                prenom: 'Pierre',
                email: 'email1@pe.fr',
                telephones: ['06 12 34 56 78'],
                emailValid: true,
                identifiant_pe: null,
                identifiant_local: null,
            },
            formation: {
                numero: null,
                intitule: 'ANOTEA FORMATION',
                domaine_formation: {
                    formacodes: [],
                },
                certifications: [],
                action: {
                    numero: 'S17AVJE93001NR',
                    lieu_de_formation: {
                        code_postal: '93190',
                        ville: 'LIVRY GARGAN',
                    },
                    organisme_financeurs: [{
                        code_financeur: '2',
                    }],
                    organisme_formateur: {
                        numero: null,
                        raison_sociale: 'ASSOCIATION AURORE',
                        label: 'ASSOCIATION AURORE',
                        siret: '77568497000673',
                    },
                    session: {
                        id: null,
                        numero: null,
                        periode: {
                            debut: new Date('2017-03-15T00:00:00.000Z'),
                            fin: new Date('2018-08-31T00:00:00.000Z'),
                        },
                    },
                },
            },
        });
    });

    it('should store import status', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), handler);

        let hash = await md5File(getTestFile('stagiaires-pe.csv'));
        let status = await db.collection('jobs').findOne();
        assert.ok(status.date);
        assert.ok(status.campaignDate);
        assert.deepStrictEqual(_.omit(status, ['_id', 'date', 'campaignDate']), {
            type: 'import-stagiaires',
            campaign: 'stagiaires-pe',
            file: getTestFile('stagiaires-pe.csv'),
            hash,
            filters: {},
            stats: {
                ignored: 0,
                imported: 4,
                invalid: 0,
                total: 4,
            }
        });
    });

    it('should store import status with campaign date', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importStagiaires(db, logger, getTestFile('stagiaires-pe_2018-11-20.csv'), handler);

        let hash = await md5File(getTestFile('stagiaires-pe_2018-11-20.csv'));
        let status = await db.collection('jobs').findOne();
        assert.ok(status.date);
        assert.deepStrictEqual(_.omit(status, ['_id', 'date']), {
            type: 'import-stagiaires',
            campaign: 'stagiaires-pe_2018-11-20',
            campaignDate: new Date('2018-11-20T00:00:00.000Z'),
            file: getTestFile('stagiaires-pe_2018-11-20.csv'),
            hash,
            filters: {},
            stats: {
                ignored: 0,
                imported: 1,
                invalid: 0,
                total: 1,
            }
        });
    });

    it('should return stats after a CSV has been imported', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let results = await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 0,
            imported: 4,
            total: 4,
        });
    });

    it('should fail to import stagiaire with invalid email', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-invalid-email.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importStagiaires(db, logger, csvFile, handler);

        let count = await db.collection('stagiaires').countDocuments();
        assert.strictEqual(count, 0);
    });

    it('can filter stagiaire by region', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let results = await importStagiaires(db, logger, csvFile, handler, {
            codeRegion: '84'
        });

        let doc = await db.collection('stagiaires').findOne();
        assert.ok(doc.individu);
        assert.deepStrictEqual(doc.individu.email, 'email_4@pe.com');
        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 3,
            imported: 1,
            total: 4,
        });
    });

    it('should filter stagiaire with conseil regional filter (included)', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-conseil-regional.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, Object.assign({}, regions, {
            findActiveRegions: () => {
                return [{
                    codeRegion: '84',
                    conseil_regional: {
                        active: true,
                    },
                }];
            }
        }));

        let results = await importStagiaires(db, logger, csvFile, handler);

        let count = await db.collection('stagiaires').count();
        assert.strictEqual(count, 2);
        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 0,
            imported: 2,
            total: 2,
        });
    });

    it('should filter stagiaire with conseil regional filter (since)', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-conseil-regional.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, Object.assign({}, regions, {
            findActiveRegions: () => {
                return [{
                    codeRegion: '84',
                    conseil_regional: {
                        active: true,
                        since: '2018-08-23',
                    },
                }];
            }
        }));

        let results = await importStagiaires(db, logger, csvFile, handler);

        let count = await db.collection('stagiaires').count();
        assert.strictEqual(count, 1);
        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 1,
            total: 2,
        });
    });

    it('should filter stagiaire with conseil regional filter (excluded)', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-conseil-regional.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, Object.assign({}, regions, {
            findActiveRegions: () => {
                return [{
                    codeRegion: '84',
                    conseil_regional: {
                        active: false,
                    },
                }];
            }
        }));

        let results = await importStagiaires(db, logger, csvFile, handler);

        let count = await db.collection('stagiaires').count();
        assert.strictEqual(count, 0);
        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 2,
            imported: 0,
            total: 2,
        });
    });

    it('should filter stagiaire with conseil regional filter (certifications_only)', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-certifications-only.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, Object.assign({}, regions, {
            findActiveRegions: () => {
                return [{
                    codeRegion: '84',
                    conseil_regional: {
                        active: true,
                        import: 'certifications_only',
                    },
                }];
            }
        }));

        let results = await importStagiaires(db, logger, csvFile, handler);

        assert.strictEqual(await db.collection('stagiaires').count(), 1);
        let doc = await db.collection('stagiaires').findOne();
        assert.deepStrictEqual(doc.individu.email, 'email_1@pe.com');
        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 1,
            total: 2,
        });
    });

    it('should ignore stagiaire with fin before min date', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-old.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, Object.assign({}, regions, {
            findActiveRegions: () => {
                return [{
                    codeRegion: '11',
                    since: '2019-08-25',
                }];
            }
        }));

        let results = await importStagiaires(db, logger, csvFile, handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

    it('should ignore stagiaire with fin before min date (IDF)', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-idf-old.csv');
        let { regions } = await getComponents();
        let handler = ileDeFranceCSVHandler(db, regions);

        let results = await importStagiaires(db, logger, csvFile, handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

    it('should handle NULL value', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-with-NULL.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importStagiaires(db, logger, csvFile, handler);

        let doc = await db.collection('stagiaires').findOne();
        assert.deepStrictEqual(doc.individu.telephones, ['0611111111']);
        assert.deepStrictEqual(doc.formation.certifications, []);
    });

    it('should ignore stagiaire with codeFinanceur filtered', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-code-financeur-filtered.csv');
        let { regions } = await getComponents();

        let stats = await importStagiaires(db, logger, csvFile, poleEmploiCSVHandler(db, regions), {
            'codeFinanceur': '2'
        });

        assert.deepStrictEqual(await db.collection('stagiaires').count(), 0);
        assert.deepStrictEqual(stats, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

    it('can filter stagiaire by codeFinanceur', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-code-financeur-filtered.csv');
        let { regions } = await getComponents();

        let stats = await importStagiaires(db, logger, csvFile, poleEmploiCSVHandler(db, regions), {
            codeFinanceur: '2',
        });

        assert.deepStrictEqual(await db.collection('stagiaires').count(), 0);
        assert.deepStrictEqual(stats, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

}));
