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

        let doc = await db.collection('accounts').findOne({ siret: '33333333333333' });
        assert.ok(doc._id);
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepStrictEqual(_.omit(doc, ['_id', 'creationDate', 'updateDate', 'token']), {
            siret: '33333333333333',
            courriel: 'contact+kairos@formation.fr',
            courriels: [
                { courriel: 'contact+kairos@formation.fr', source: 'kairos' },
            ],
            sources: ['kairos'],
            profile: 'organisme',
            codeRegion: '10',
            raison_sociale: 'Pole Emploi Formation Nord',
            lieux_de_formation: [],
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

        let doc = await db.collection('accounts').findOne({ siret: '22222222222222' });
        assert.ok(doc._id);
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepStrictEqual(_.omit(doc, ['_id', 'creationDate', 'updateDate', 'token']), {
            siret: '22222222222222',
            codeRegion: '11',
            courriel: 'anotea.pe+paris@gmail.com',
            courriels: [
                { courriel: 'anotea.pe+paris@gmail.com', source: 'intercarif' },
                { courriel: 'contact+kairos@formation.fr', source: 'kairos' },
            ],
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
            profile: 'organisme',
            raison_sociale: 'Anotea Formation Paris',
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
