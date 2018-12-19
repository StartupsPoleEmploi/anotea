const assert = require('assert');
const path = require('path');
const _ = require('lodash');
const { withMongoDB } = require('../../../../../helpers/test-db');
const logger = require('../../../../../helpers/test-logger');
const generateOrganismesKairos = require('../../../../../../lib/jobs/import/organismes/generators/generateOrganismesKairos');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    const insertDepartements = () => {
        return Promise.all([
            insertIntoDatabase('departements', {
                region: 'Grand Est',
                dept_num: '57',
                region_num: '7'
            }),
            insertIntoDatabase('departements', {
                region: 'Aquitaine',
                dept_num: '33',
                region_num: '1'
            }),
            insertIntoDatabase('departements', {
                region: 'Hauts-de-France',
                dept_num: '59',
                region_num: '10'
            })
        ]);
    };

    it('should create collection with organismes from CSV file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../../helpers/data', 'kairos-organismes.csv');
        await insertDepartements();

        let stats = await generateOrganismesKairos(db, logger, csvFile);

        assert.deepEqual(stats, {
            inserted: 3,
            invalid: 0,
        });

        let count = await db.collection('kairos_organismes').countDocuments();
        assert.deepEqual(count, 3);

        let organisme = await db.collection('kairos_organismes').findOne();
        assert.deepEqual(_.omit(organisme, ['_id']), {
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
}));
