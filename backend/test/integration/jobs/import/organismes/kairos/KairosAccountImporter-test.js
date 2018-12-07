const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/test-db');
const { newOrganismeAccount, newComment } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/test-logger');
const KairosAccountImporter = require('../../../../../../jobs/import/organismes/kairos/KairosAccountImporter');

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

    it('should create new organismes', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../../helpers/data', 'kairos-organismes.csv');
        let importer = new KairosAccountImporter(db, logger);
        await insertDepartements();
        await Promise.all(_.range(2).map(() => {
            return insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: '11111111111111',
                    },
                }
            }));
        }));

        await importer.importAccounts(csvFile);

        let count = await db.collection('organismes').countDocuments();
        assert.equal(count, 3);

        let doc = await db.collection('organismes').findOne({ SIRET: 11111111111111 });

        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        let comparable = _.omit(doc, ['creationDate', 'token', 'updateDate']);
        assert.deepEqual(comparable, {
            _id: 11111111111111,
            SIRET: 11111111111111,
            raisonSociale: 'Pole Emploi Alsace',
            courriel: 'contact@formation.fr',
            kairosCourriel: 'contact@formation.fr',
            courriels: ['contact@formation.fr'],
            sources: ['kairos'],
            codeRegion: '7',
            score: {
                nb_avis: 2,
                notes: {
                    accompagnement: 1,
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    global: 2,
                }
            },
            meta: {
                siretAsString: '11111111111111',
            },
        });
    });

    it('should update organismes', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../../helpers/data', 'kairos-organismes.csv');
        let importer = new KairosAccountImporter(db, logger);
        await insertDepartements();
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 22222222222222,
                SIRET: 22222222222222,
                raisonSociale: 'Pole Emploi',
                courriel: 'previous@formation.fr',
                codeRegion: '99', //Invalid
                passwordHash: '123456780',
                token: '12345',
                creationDate: new Date('2016-11-10T17:41:03.308Z'),
                mailSentDate: new Date('2017-11-10T17:41:03.308Z'),
                score: {
                    nb_avis: 1,
                },
                meta: {
                    siretAsString: '22222222222222',
                },
            })),
            _.range(2).map(() => {
                return insertIntoDatabase('comment', newComment({
                    training: {
                        organisation: {
                            siret: '22222222222222',
                        },
                    }
                }));
            })
        ]);

        await importer.importAccounts(csvFile);

        let doc = await db.collection('organismes').findOne({ SIRET: 22222222222222 });

        assert.ok(doc.updateDate);
        assert.deepEqual(_.omit(doc, ['updateDate']), {
            _id: 22222222222222,
            SIRET: 22222222222222,
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            token: '12345',
            raisonSociale: 'Pole Emploi',
            passwordHash: '123456780',
            mailSentDate: new Date('2017-11-10T17:41:03.308Z'),
            courriel: 'previous@formation.fr',
            kairosCourriel: 'contact+kairos@formation.fr',
            courriels: ['contact+kairos@formation.fr'],
            codeRegion: '1',
            sources: ['kairos'],
            numero: '14_OF_0000000123',
            lieux_de_formation: [
                {
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris 19e',
                        region: '11'
                    }
                }
            ],
            score: {
                nb_avis: 2,
                notes: {
                    accompagnement: 1,
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    global: 2,
                }
            },
            meta: {
                siretAsString: '22222222222222',
            }
        });
    });
}));
