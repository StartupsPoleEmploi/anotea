const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newComment, newSession } = require('../../../../helpers/data/dataset');
const generateActions = require('../../../../../src/jobs/import/sessions/generateActions');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif, insertRegions }) => {

    it('should generate actions from sessions', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        let comment = newComment({
            formacode: '31801',
            training: {
                formacode: '31801',
                certifInfo: {
                    id: '55518',
                },
                organisation: {
                    siret: '22222222222222',
                },
                place: {
                    postalCode: '75019',
                },
            }
        }, date);

        await Promise.all([
            importIntercarif(),
            insertRegions(),
            insertIntoDatabase('sessionsReconciliees', newSession({
                avis: [comment],
            })),
        ]);

        await generateActions(db);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.deepEqual(action, {
            _id: 'F_XX_XX|AC_XX_XXXXXX',
            numero: 'AC_XX_XXXXXX',
            region: '11',
            code_region: '11',
            avis: [comment],
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 4,
                    contenu_formation: 4,
                    equipe_formateurs: 4,
                    moyen_materiel: 4,
                    accompagnement: 4,
                    global: 4
                }
            },
            organisme_financeurs: ['2'],
            organisme_formateur: {
                raison_sociale: 'Anotea Formation Paris',
                siret: '22222222222222',
                numero: 'OF_XXX'
            },
            lieu_de_formation: {
                code_postal: '75019',
                ville: 'Paris'
            },
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur web',
                domaine_formation: {
                    formacodes: [
                        '31801'
                    ]
                },
                certifications: [
                    '55518'
                ]
            },
            meta: {
                source: 'intercarif',
                reconciliation: {
                    organisme_formateur: '22222222222222',
                    lieu_de_formation: '75019',
                    certifinfos: [
                        '55518'
                    ],
                    formacodes: [
                        '31801'
                    ]
                },
            }
        });
    });
}));
