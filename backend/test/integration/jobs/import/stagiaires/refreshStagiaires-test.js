const _ = require('lodash');
const assert = require('assert');
const { newAvis } = require('../../../../helpers/data/dataset');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const logger = require('../../../../helpers/components/fake-logger');
const importStagiaires = require('../../../../../src/jobs/import/stagiaires/tasks/importStagiaires');
const refreshStagiaires = require('../../../../../src/jobs/import/stagiaires/tasks/refreshStagiaires');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/poleEmploiCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getComponents, getTestFile, insertIntoDatabase }) => {

    it('should refresh stagiaires from csv file', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();

        await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), poleEmploiCSVHandler(db, regions));
        let stats = await refreshStagiaires(db, logger, getTestFile('stagiaires-pe-refreshed.csv'), poleEmploiCSVHandler(db, regions));

        assert.deepStrictEqual(stats, {
            ignored: 0,
            refreshed: 1,
            invalid: 0,
            total: 1,
        });

        let stagiaire = await db.collection('stagiaires').findOne({ 'individu.nom': 'MARTIN' });
        assert.ok(stagiaire._id);
        assert.ok(stagiaire.importDate);
        assert.ok(stagiaire.campaignDate);
        assert.ok(stagiaire.token);
        assert.deepStrictEqual(_.omit(stagiaire, ['_id', 'importDate', 'token', 'campaignDate']), {
            campaign: 'stagiaires-pe',
            avisCreated: false,
            unsubscribe: false,
            mailSent: false,
            codeRegion: '11',
            refreshKey: '166580d3eca85596be989a9fb397b980',
            dispositifFinancement: 'BEN',
            individu: {
                nom: 'MARTIN',
                prenom: 'EUGENE',
                email: 'email_1@pe.com',
                telephones: ['0611111111'],
                emailValid: true,
                identifiant_pe: '1111111111',
                identifiant_local: '0167942369A'
            },
            formation: {
                numero: '14_AF_0000044465',
                intitule: 'Titre professionnel',
                domaine_formation: {
                    formacodes: ['31734'],
                },
                certifications: [{ certif_info: '8122' }],
                action: {
                    numero: '14_SE_0000160070',
                    lieu_de_formation: {
                        code_postal: '91130',
                        ville: 'Ris-Orangis',
                    },
                    organisme_financeurs: [
                        { code_financeur: '4' },
                        { code_financeur: '7' },
                    ],
                    organisme_formateur: {
                        raison_sociale: 'ANOTEA ACCES FORMATION',
                        label: 'ANOTEA FORMATION',
                        siret: '82436343601230',
                        numero: '14000000000000008098',
                    },
                    session: {
                        id: '3565575',
                        numero: 'SE_0000160070',
                        periode: {
                            debut: new Date('2018-05-22T00:00:00.000Z'),
                            fin: new Date('2018-08-24T00:00:00.000Z'),
                        },
                    },
                },
            },
        });
    });

    it('should refresh avis from csv file', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();

        await Promise.all([
            await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), poleEmploiCSVHandler(db, regions)),
            await insertIntoDatabase('avis', newAvis({ refreshKey: '166580d3eca85596be989a9fb397b980', dispositifFinancement: 'AIF' }))

        ]);

        await refreshStagiaires(db, logger, getTestFile('stagiaires-pe-refreshed.csv'), poleEmploiCSVHandler(db, regions));

        let avis = await db.collection('avis').findOne();
        assert.deepStrictEqual(avis.dispositifFinancement, 'BEN');
    });

}));
