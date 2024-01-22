const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newOrganismeAccount, newIntercarif } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/components/fake-logger');
const synchronizeAccountsWithIntercarif = require('../../../../../src/jobs/import/organismes/tasks/synchronizeAccountsResponsableWithIntercarif');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {
    
    
    it('should create account', async () => {

        let db = await getTestDatabase();
        await importIntercarif();

        await synchronizeAccountsWithIntercarif(db, logger);

        let doc = await db.collection('accounts').findOne({ siret: '11111111111111' });
        assert.ok(doc._id);
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepStrictEqual(_.omit(doc, ['_id', 'creationDate', 'updateDate', 'token']), {
            siret: '11111111111111',
            courriel: 'responsable@anotea.francetravail.fr',
            courriels: [{ courriel: 'responsable@anotea.francetravail.fr', source: 'intercarif' }],
            sources: ['intercarif'],
            profile: 'organisme',
            codeRegion: '11',
            raison_sociale: 'Centre de formation Anotéa',
            lieux_de_formation: [],
        });
    });

    it('should update account 1', async () => {

        let db = await getTestDatabase();
        let intercarif = newIntercarif();
        
        await insertIntoDatabase('intercarif', intercarif);
        await synchronizeAccountsWithIntercarif(db, logger);

        let doc = await db.collection('accounts').findOne({ siret: '11111111111111' });
        assert.ok(doc._id);
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepStrictEqual(_.omit(doc, ['_id', 'creationDate', 'updateDate', 'token']), {
            siret: '11111111111111',
            codeRegion: '11',
            courriel: "responsableCoordonnees@anotea.francetravail.fr",
            courriels: [
                {
                    courriel: "responsableCoordonnees@anotea.francetravail.fr",
                    source: "intercarif"
                }
            ],
            sources: ['intercarif'],
            profile: 'organisme',
            raison_sociale: 'Centre de formation Anotéa',
            lieux_de_formation: [],
        });
    });

    it('should update account 2', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
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

        let doc = await db.collection('accounts').findOne({ siret: '11111111111111' });
        assert.deepStrictEqual(_.omit(doc, ['_id', 'updateDate']), {
            siret: '11111111111111',
            raison_sociale: 'Centre de formation Anotéa',
            passwordHash: 'hash',
            profile: 'organisme',
            token: 'token',
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
            courriel: 'OLD@formateur.com',
            courriels: [
                { courriel: 'contact@poleemploi-formation.fr', source: 'intercarif' },
                { courriel: 'responsable@anotea.francetravail.fr', source: 'intercarif' },
            ],
            sources: ['intercarif'],
            codeRegion: '11',
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
