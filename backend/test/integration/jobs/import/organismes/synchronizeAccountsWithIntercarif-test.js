const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newOrganismeAccount, newIntercarif } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/components/fake-logger');
const synchronizeAccountsWithIntercarif = require('../../../../../src/jobs/import/organismes/tasks/synchronizeAccountsWithIntercarif');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    it('should create account', async () => {

        let db = await getTestDatabase();
        await importIntercarif();

        await synchronizeAccountsWithIntercarif(db, logger);

        let doc = await db.collection('accounts').findOne({ siret: '22222222222222' });
        assert.ok(doc._id);
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepStrictEqual(_.omit(doc, ['_id', 'creationDate', 'updateDate', 'token']), {
            siret: '22222222222222',
            courriel: 'anotea.pe+paris@gmail.com',
            courriels: [{ courriel: 'anotea.pe+paris@gmail.com', source: 'intercarif' }],
            sources: ['intercarif'],
            profile: 'organisme',
            codeRegion: '11',
            raison_sociale: 'Anotea Formation Paris',
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
        });
    });

    it('should create account with multiple actions (sorted by code postaux)', async () => {

        let db = await getTestDatabase();
        let intercarif = newIntercarif();
        intercarif.actions.push(_.merge({}, intercarif.actions[0], {
            organisme_formateur: {
                raison_sociale_formateur: 'Anotea Formation Paris Bis',
                contact_formateur: {
                    coordonnees: {
                        courriel: 'anotea.pe+bis@gmail.com',
                    }
                }
            },
            lieu_de_formation: {
                coordonnees: {
                    nom: 'Anotea Formation Paris Bis',
                    adresse: {
                        codepostal: '75011',
                    },
                }
            }
        }));
        await insertIntoDatabase('intercarif', intercarif);

        await synchronizeAccountsWithIntercarif(db, logger);

        let doc = await db.collection('accounts').findOne({ siret: '22222222222222' });
        assert.ok(doc._id);
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepStrictEqual(_.omit(doc, ['_id', 'creationDate', 'updateDate', 'token']), {
            siret: '22222222222222',
            courriel: 'anotea.pe+paris@gmail.com',
            courriels: [
                { courriel: 'anotea.pe+paris@gmail.com', source: 'intercarif' },
                { courriel: 'anotea.pe+bis@gmail.com', source: 'intercarif' },
            ],
            sources: ['intercarif'],
            profile: 'organisme',
            codeRegion: '11',
            raison_sociale: 'Anotea Formation Paris Bis',
            lieux_de_formation: [
                {
                    nom: 'Anotea Formation Paris Bis',
                    adresse: {
                        code_postal: '75011',
                        ville: 'Paris',
                        region: '11'
                    }
                },
                {
                    nom: 'Anotea Formation Paris',
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris',
                        region: '11'
                    }
                },
            ],
        });
    });

    it('should update account', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
                raison_sociale: 'Formateur',
                codeRegion: '01',
                courriel: 'OLD@formateur.com',
                passwordHash: 'hash',
                token: 'token',
                creationDate: new Date('2016-11-10T17:41:03.308Z'),
                mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
            })),
        ]);

        await synchronizeAccountsWithIntercarif(db, logger);

        let doc = await db.collection('accounts').findOne({ siret: '22222222222222' });
        assert.deepStrictEqual(_.omit(doc, ['_id', 'updateDate']), {
            siret: '22222222222222',
            raison_sociale: 'Anotea Formation Paris',
            passwordHash: 'hash',
            profile: 'organisme',
            token: 'token',
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
            courriel: 'OLD@formateur.com',
            courriels: [
                { courriel: 'contact@poleemploi-formation.fr', source: 'intercarif' },
                { courriel: 'anotea.pe+paris@gmail.com', source: 'intercarif' },
            ],
            sources: ['intercarif'],
            codeRegion: '11',
            numero: '14_OF_0000000123',
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
            score: {
                nb_avis: 15,
                notes: {
                    accueil: 5.1,
                    contenu_formation: 5.1,
                    equipe_formateurs: 4.1,
                    moyen_materiel: 3.1,
                    accompagnement: 4.1,
                    global: 5.1,
                },
                aggregation: {
                    global: {
                        max: 5.1,
                        min: 1,
                    },
                },
            },
        });
    });

}));
