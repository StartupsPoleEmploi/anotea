const assert = require('assert');
const path = require('path');
const _ = require('lodash');
const { withMongoDB } = require('../../../../helpers/test-database');
const logger = require('../../../../helpers/test-logger');
const importKairosCSV = require('../../../../../src/jobs/import/kairos/tasks/importKairosCSV');

describe(__filename, withMongoDB(({ getTestDatabase }) => {

    it('should create collection with organismes from CSV file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'kairos-organismes.csv');

        let stats = await importKairosCSV(db, logger, csvFile);

        assert.deepStrictEqual(stats, {
            inserted: 3,
            invalid: 0,
        });

        let count = await db.collection('kairos').countDocuments();
        assert.deepStrictEqual(count, 3);

        let organisme = await db.collection('kairos').findOne();
        assert.deepStrictEqual(_.omit(organisme, ['_id']), {
            siret: '11111111111111',
            codeRegion: '7',
            libelle: 'Pole Emploi Alsace',
            region: 'Grand Est',
            nomRGC: 'Dupont',
            prenomRGC: 'Henri',
            emailRGC: 'contact@formation.fr',
            telephoneRGC: '',
            assedic: '17',
            convention: '0126XXX-1/1',
            dateDebut: new Date('2017-09-05T00:00:00.000Z'),
            dateFin: new Date('2020-09-05T00:00:00.000Z'),
        });
    });

    it('should reject invalid file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'invalid.csv');

        try {
            await importKairosCSV(db, logger, csvFile);
            assert.fail('Should have fail');
        } catch (e) {
            assert.deepStrictEqual(e.code, 'ENOENT');
        }
    });
}));
