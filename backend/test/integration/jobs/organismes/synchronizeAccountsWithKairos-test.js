const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../helpers/test-database');
const logger = require('../../../helpers/test-logger');
const importKairosCSV = require('../../../../src/jobs/import/kairos/tasks/importKairosCSV');
const synchronizeAccountsWithIntercarif = require('../../../../src/jobs/organismes/tasks/synchronizeAccountsWithIntercarif');
const synchronizeAccountsWithKairos = require('../../../../src/jobs/organismes/tasks/synchronizeAccountsWithKairos');

describe(__filename, withMongoDB(({ getTestDatabase, importIntercarif, getComponents }) => {

    let csvFile = path.join(__dirname, '../../../helpers/data', 'kairos-organismes.csv');

    it('should create new organisme from kairos', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importKairosCSV(db, logger, csvFile)
        ]);

        await synchronizeAccountsWithKairos(db, logger);

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

    it('should update organisme already imported from intercarif', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();

        await Promise.all([
            importIntercarif(),
            importKairosCSV(db, logger, csvFile)
        ]);

        await synchronizeAccountsWithIntercarif(db, logger, regions);
        await synchronizeAccountsWithKairos(db, logger);

        let doc = await db.collection('accounts').findOne({ SIRET: 22222222222222 });
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepStrictEqual(_.omit(doc, ['creationDate', 'updateDate', 'token']), {
            _id: 22222222222222,
            SIRET: 22222222222222,
            codeRegion: '15',
            kairosCourriel: 'contact+kairos@formation.fr',
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
            numero: 'OF_XXX',
            profile: 'organisme',
            raisonSociale: 'Anotea Formation Paris',
            sources: ['intercarif', 'kairos'],
        });
    });

}));
