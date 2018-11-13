const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-db');
const { newOrganismeAccount, newComment } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/test-logger');
const kairosOrganismesImporter = require('../../../../../jobs/import/account/importers/kairosAccountImporter');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    const insertRegions = () => {
        return Promise.all([
            insertIntoDatabase('regions', {
                region: 'Grand Est',
                dept_num: '57',
                region_num: '7'
            }),
            insertIntoDatabase('regions', {
                region: 'Aquitaine',
                dept_num: '33',
                region_num: '1'
            }),
            insertIntoDatabase('regions', {
                region: 'Hauts-de-France',
                dept_num: '59',
                region_num: '10'
            }),
        ]);
    };

    it('should create new organismes', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'kairos-organismes.csv');
        let importer = kairosOrganismesImporter(db, logger);
        await insertRegions();

        await importer.importAccounts(csvFile);

        let count = await db.collection('organismes').countDocuments();
        assert.equal(count, 3);

        let doc = await db.collection('organismes').findOne({ SIRET: 11111111111111 });

        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        let comparable = _.omit(doc, ['creationDate', 'token']);
        delete comparable.meta.kairosData.updateDate;
        assert.deepEqual(comparable, {
            _id: 11111111111111,
            SIRET: 11111111111111,
            raisonSociale: 'Pole Emploi Alsace',
            courriel: 'contact@formation.fr',
            sources: ['kairos'],
            codeRegion: '7',
            meta: {
                siretAsString: '11111111111111',
                nbAvis: 0,
                kairosData: {
                    libelle: 'Pole Emploi Alsace',
                    region: 'Grand Est',
                    nomRGC: 'Dupont',
                    prenomRGC: 'Henri',
                    emailRGC: 'contact@formation.fr',
                    telephoneRGC: '',
                    convention: '0126XXX-1/1',
                    dateDebut: new Date('2017-09-04T22:00:00.000Z'),
                    dateFin: new Date('2020-09-04T22:00:00.000Z'),
                },
            },
        });
    });

    it('should update only specific properties of an exiting organisme', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'kairos-organismes.csv');
        let importer = kairosOrganismesImporter(db, logger);
        await insertRegions();
        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: 22222222222222,
            SIRET: 22222222222222,
            raisonSociale: 'Pole Emploi',
            courriel: 'contact@formation',
            codeRegion: '99', //Invalid
            passwordHash: '123456780',
            token: '12345',
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            mailSentDate: new Date('2017-11-10T17:41:03.308Z'),
            meta: {
                siretAsString: '22222222222222',
                nbAvis: 0,
            },
        }));

        await importer.importAccounts(csvFile);

        let doc = await db.collection('organismes').findOne({ SIRET: 22222222222222 });

        assert.ok(doc.updateDate);
        assert.deepEqual(_.omit(doc, ['updateDate']), {

            //UNTOUCHED
            _id: 22222222222222,
            SIRET: 22222222222222,
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            token: '12345',
            raisonSociale: 'Pole Emploi',
            passwordHash: '123456780',
            mailSentDate: new Date('2017-11-10T17:41:03.308Z'),

            //UPDATED
            courriel: 'contact@formation',
            courrielsSecondaires: ['contact+kairos@formation.fr'],
            sources: ['kairos'],
            codeRegion: '1',
            meta: {
                siretAsString: '22222222222222',
                nbAvis: 0,
                kairosData: {
                    libelle: 'Pole Emploi Formation Aquitaine',
                    region: 'Nouvelle Aquitaine',
                    nomRGC: 'Dupont',
                    prenomRGC: 'Mauricette',
                    emailRGC: 'contact+kairos@formation.fr',
                    telephoneRGC: '0123456789',
                    convention: '01184XX-1',
                    dateDebut: new Date('2016-04-24T22:00:00.000Z'),
                    dateFin: new Date('2019-04-23T22:00:00.000Z')
                }
            },
        });
    });

    it('when courriel is missing should add it', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'kairos-organismes.csv');
        let importer = kairosOrganismesImporter(db, logger);
        await insertRegions();
        await insertIntoDatabase('organismes', {
            _id: 22222222222222,
            SIRET: 22222222222222,
            raisonSociale: 'Pole Emploi',
            creationDate: new Date('2017-11-10T17:16:37.758Z'),
            token: '538df592-7f28-47ac-8686-1563caf1218a',
            mailSentDate: new Date('2017-11-10T17:41:03.308Z'),
            passwordHash: 'faceb588f56d25ca26296ea08421ae6a79c6e78b51117b5e12c99c6ad8214361'
        });

        await importer.importAccounts(csvFile);

        let doc = await db.collection('organismes').findOne({ SIRET: 22222222222222 });

        assert.deepEqual(doc.courriel, 'contact+kairos@formation.fr');
    });

    it('should compute nbAvis', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'kairos-organismes.csv');
        let importer = kairosOrganismesImporter(db, logger);

        await Promise.all([
            insertRegions(),
            insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: `22222222222222`,
                    },
                }
            }))
        ]);

        await importer.importAccounts(csvFile);

        let doc = await db.collection('organismes').findOne({ SIRET: 22222222222222 });
        assert.deepEqual(doc.meta.nbAvis, 1);
    });
}));
