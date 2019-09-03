const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/test-database');
const logger = require('../../../../../helpers/test-logger');
const importTrainee = require('../../../../../../src/jobs/import/stagiaires/tasks/importTrainee');
const ileDeFranceCSVHandler = require('../../../../../../src/jobs/import/stagiaires/tasks/handlers/ileDeFranceCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getTestFile, getComponents }) => {

    it('should import trainees from CSV file', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = ileDeFranceCSVHandler(db, regions);

        await importTrainee(db, logger, getTestFile('stagiaires-idf.csv'), handler);

        let count = await db.collection('trainee').countDocuments();
        assert.strictEqual(count, 5);
        let docs = await db.collection('trainee').find({ 'trainee.email': 'email1@pe.fr' }).toArray();
        assert.ok(docs[0]._id);
        assert.ok(docs[0].importDate);
        assert.ok(docs[0].campaignDate);
        assert.ok(docs[0].token);
        assert.deepStrictEqual(_.omit(docs[0], ['_id', 'importDate', 'token', 'campaignDate']), {
            campaign: 'stagiaires-idf',
            sourceIDF: true,
            avisCreated: false,
            trainee: {
                name: 'MARTIN',
                firstName: 'Pierre',
                mailDomain: 'pe.fr',
                email: 'email1@pe.fr',
                phoneNumbers: ['06 12 34 56 78'],
                emailValid: true,
                dnIndividuNational: null,
                idLocal: null,
            },
            training: {
                idFormation: null,
                origineSession: null,
                title: 'ANOTEA FORMATION',
                startDate: new Date('2017-03-15T00:00:00.000Z'),
                scheduledEndDate: new Date('2018-08-31T00:00:00.000Z'),
                organisation: {
                    id: null,
                    siret: '77568497000673',
                    label: 'ASSOCIATION AURORE',
                    name: 'ASSOCIATION AURORE'
                },
                place: {
                    postalCode: '93190',
                    city: 'LIVRY GARGAN'
                },
                certifInfo: {
                    id: null,
                    label: null
                },
                idSession: null,
                formacode: null,
                referencement: null,
                infoCarif: {
                    numeroAction: null,
                    numeroSession: null
                },
                codeFinanceur: [
                    '2'
                ],
                niveauEntree: null,
                niveauSortie: null,
                dureeHebdo: null,
                dureeMaxi: null,
                dureeEntreprise: null,
                dureeIndicative: null,
                nombreHeuresCentre: null,
                infoRegion: {
                    idTrainee: '111111',
                    idActionFormation: 'S17AVJE93001NR',
                    idParcours: '17392'
                }
            },
            unsubscribe: false,
            mailSent: false,
            codeRegion: '11',
        });
    });

    it('should ignore trainees too old', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-idf-old.csv');
        let { regions } = await getComponents();
        let handler = ileDeFranceCSVHandler(db, regions);

        let results = await importTrainee(db, logger, csvFile, handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

}));
