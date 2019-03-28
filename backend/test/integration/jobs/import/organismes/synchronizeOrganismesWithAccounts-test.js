const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newOrganismeAccount } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/test-logger');
const synchronizeOrganismesWithAccounts = require('../../../../../src/jobs/import/organismes/synchronizeOrganismesWithAccounts');
const generateOrganismesFromIntercarif = require('../../../../../src/jobs/import/organismes/generateOrganismesFromIntercarif');
const generateOrganismesFromKairos = require('../../../../../src/jobs/import/organismes/generateOrganismesFromKairos');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif, getComponents }) => {

    let csvFile = path.join(__dirname, '../../../../helpers/data', 'kairos-organismes.csv');

    it('should create new organisme formateur and merge Kairos data', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        await importIntercarif();

        await generateOrganismesFromIntercarif(db, logger);
        await generateOrganismesFromKairos(db, logger, csvFile);
        await synchronizeOrganismesWithAccounts(db, logger, regions);

        let doc = await db.collection('accounts').findOne({ SIRET: 22222222222222 });
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepStrictEqual(_.omit(doc, ['creationDate', 'updateDate', 'token']), {
            _id: 22222222222222,
            SIRET: 22222222222222,
            courriel: 'anotea.pe+paris@gmail.com',
            courriels: ['anotea.pe+paris@gmail.com'],
            sources: ['intercarif'],
            profile: 'organisme',
            codeRegion: '15',
            kairosCourriel: 'contact+kairos@formation.fr',
            numero: 'OF_XXX',
            raisonSociale: 'Anotea Formation Paris',
            lieux_de_formation: [
                {
                    nom: 'Anotea Formation Paris',
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris',
                        region: '11'
                    }
                }
            ],
            meta: {
                siretAsString: '22222222222222',
                kairos: {
                    eligible: false,
                }
            },
        });
    });

    it('should update organismes', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 22222222222222,
                SIRET: 22222222222222,
                raisonSociale: 'Formateur',
                courriel: 'OLD@formateur.com',
                passwordHash: 'hash',
                token: 'token',
                creationDate: new Date('2016-11-10T17:41:03.308Z'),
                mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
                meta: {
                    siretAsString: '22222222222222',
                },
            })),
        ]);

        await generateOrganismesFromIntercarif(db, logger);
        await generateOrganismesFromKairos(db, logger, csvFile);
        await synchronizeOrganismesWithAccounts(db, logger, regions);

        let doc = await db.collection('accounts').findOne({ SIRET: 22222222222222 });
        assert.ok(doc.updateDate);
        assert.deepStrictEqual(_.omit(doc, ['updateDate']), {
            _id: 22222222222222,
            SIRET: 22222222222222,
            raisonSociale: 'Formateur',
            passwordHash: 'hash',
            profile: 'organisme',
            token: 'token',
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
            courriel: 'OLD@formateur.com',
            courriels: ['anotea.pe+paris@gmail.com'],
            sources: ['intercarif'],
            codeRegion: '11',
            numero: 'OF_XXX',
            lieux_de_formation: [
                {
                    nom: 'Anotea Formation Paris',
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris',
                        region: '11'
                    }
                }
            ],
            score: {
                nb_avis: 15,
                notes: {
                    accueil: 5,
                    contenu_formation: 5,
                    equipe_formateurs: 4,
                    moyen_materiel: 3,
                    accompagnement: 4,
                    global: 5
                }
            },
            meta: {
                siretAsString: '22222222222222',
            },
        });
    });

    it('should create new organisme responsable', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        await importIntercarif();

        await generateOrganismesFromIntercarif(db, logger);
        await generateOrganismesFromKairos(db, logger, csvFile);
        await synchronizeOrganismesWithAccounts(db, logger, regions);

        let doc = await db.collection('accounts').findOne({ SIRET: 11111111111111 });
        assert.ok(doc);
    });

    it('should create new organisme from kairos', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        await importIntercarif();

        await generateOrganismesFromIntercarif(db, logger);
        await generateOrganismesFromKairos(db, logger, csvFile);
        await synchronizeOrganismesWithAccounts(db, logger, regions);

        let doc = await db.collection('accounts').findOne({ SIRET: 33333333333333 });
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepStrictEqual(_.omit(doc, ['creationDate', 'updateDate', 'token']), {
            _id: 33333333333333,
            SIRET: 33333333333333,
            courriel: 'contact+kairos@formation.fr',
            courriels: ['contact+kairos@formation.fr'],
            sources: ['kairos'],
            profile: 'organisme',
            codeRegion: '10',
            kairosCourriel: 'contact+kairos@formation.fr',
            numero: null,
            raisonSociale: 'Pole Emploi Formation Nord',
            lieux_de_formation: [],
            meta: {
                siretAsString: '33333333333333',
                kairos: {
                    eligible: false,
                }
            },
        });
    });

}));
