const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../helpers/with-mongodb');
const logger = require('../../../helpers/components/fake-logger');
const synchronizeAccountsWithIntercarif = require('../../../../src/jobs/organismes/tasks/synchronizeAccountsWithIntercarif');
const synchronizeAccountsWithKairos = require('../../../../src/jobs/organismes/tasks/synchronizeAccountsWithKairos');

describe(__filename, withMongoDB(({ getTestDatabase, importIntercarif }) => {

    let csvFile = path.join(__dirname, '../../../helpers/data', 'kairos-organismes.csv');

    it('should create new organisme from kairos', async () => {

        let db = await getTestDatabase();

        await synchronizeAccountsWithKairos(db, logger, csvFile);

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

    it('should reject invalid csv file', async () => {

        let db = await getTestDatabase();
        let invalidFile = path.join(__dirname, '../../../helpers/data', 'kairos-organismes-invalid.csv');

        try {
            await synchronizeAccountsWithKairos(db, logger, invalidFile);
            assert.fail();
        } catch (e) {
            assert.strictEqual(e.message, 'Region inconnue INVALID');
        }
    });

    it('should update organisme already imported from intercarif', async () => {

        let db = await getTestDatabase();

        await importIntercarif();

        await synchronizeAccountsWithIntercarif(db, logger);
        await synchronizeAccountsWithKairos(db, logger, csvFile);

        let doc = await db.collection('accounts').findOne({ SIRET: 22222222222222 });
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepStrictEqual(_.omit(doc, ['creationDate', 'updateDate', 'token']), {
            _id: 22222222222222,
            SIRET: 22222222222222,
            codeRegion: '11',
            courriel: 'anotea.pe+paris@gmail.com',
            courriels: ['anotea.pe+paris@gmail.com', 'contact+kairos@formation.fr'],
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
                    'eligible': false,
                },
            },
            profile: 'organisme',
            raisonSociale: 'Anotea Formation Paris',
            sources: ['intercarif', 'kairos'],
        });
    });


    it('should reject invalid csv file', async () => {

        let db = await getTestDatabase();
        let invalidFile = path.join(__dirname, '../../../helpers/data', 'kairos-organismes-invalid.csv');

        try {
            await synchronizeAccountsWithKairos(db, logger, invalidFile);
            assert.fail();
        } catch (e) {
            assert.ok(e);
        }
    });

}));
