const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const configuration = require('config');
const { withMongoDB } = require('../../../../helpers/test-db');
const logger = require('../../../../helpers/test-logger');
const traineeImporter = require('../../../../../jobs/import/trainee/traineeImporter');
const ileDeFranceCSVHandler = require('../../../../../jobs/import/trainee/handlers/ileDeFranceCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase }) => {

    it('should import trainees from CSV file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-idf.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = ileDeFranceCSVHandler(db, logger, configuration);

        await importer.importTrainee(csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.equal(count, 5);
        let docs = await db.collection('trainee').find({ 'trainee.email': 'email1@pe.fr' }).toArray();
        assert.ok(docs[0]._id);
        assert.ok(docs[0].importDate);
        assert.ok(docs[0].token);
        assert.deepEqual(_.omit(docs[0], ['_id', 'importDate', 'token']), {
            campaign: 'stagiaires-idf',
            sourceIDF: true,
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
                startDate: new Date('2017-03-14T23:00:00.000Z'),
                scheduledEndDate: new Date('2018-08-30T22:00:00.000Z'),
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

    it('should store import status', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-idf.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = ileDeFranceCSVHandler(db, logger, configuration);

        await importer.importTrainee(csvFile, handler);

        let status = await db.collection('importTrainee').findOne();
        assert.deepEqual(_.omit(status, ['_id', 'date']), {
            campaign: 'stagiaires-idf',
            hash: '2c12f115c721ef5c54660603e68d45b9',
        });
    });

    it('cannot import same CSV twice', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-idf.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = ileDeFranceCSVHandler(db, logger, configuration);

        await importer.importTrainee(csvFile, handler);

        try {
            await importer.importTrainee(csvFile, handler);
            assert.fail('Should have fail');
        } catch (e) {
            assert.ok(e.message.indexOf('already imported') !== -1);
        }

    });
}));
