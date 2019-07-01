const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../helpers/test-database');
const logger = require('../../../helpers/test-logger');
const importKairosCSV = require('../../../../src/jobs/import/kairos/tasks/importKairosCSV');
const addMissingAccountFromKairos = require('../../../../src/jobs/organismes/tasks/addMissingAccountFromKairos');

describe(__filename, withMongoDB(({ getTestDatabase, importIntercarif }) => {

    let csvFile = path.join(__dirname, '../../../helpers/data', 'kairos-organismes.csv');

    it('should create new organisme from kairos', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            importKairosCSV(db, logger, csvFile)
        ]);

        await addMissingAccountFromKairos(db, logger);

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
