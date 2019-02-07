const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newComment, newSession } = require('../../../../helpers/data/dataset');
const generateActions = require('../../../../../src/jobs/import/sessions/generateActions');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif, insertRegions }) => {

    it('should generate actions from sessions', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        let duplicatedAvis = newComment({
            pseudo: 'robert',
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

        let uniqueAvis = newComment({
            pseudo: 'john',
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
                _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXX1',
                avis: [duplicatedAvis],
                score: {
                    nb_avis: 1,
                    notes: {
                        accueil: 5,
                        contenu_formation: 5,
                        equipe_formateurs: 5,
                        moyen_materiel: 5,
                        accompagnement: 5,
                        global: 5,
                    }
                },
            })),
            insertIntoDatabase('sessionsReconciliees', newSession({
                _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXX2',
                avis: [duplicatedAvis, uniqueAvis],
                score: {
                    nb_avis: 1,
                    notes: {
                        accueil: 1,
                        contenu_formation: 1,
                        equipe_formateurs: 1,
                        moyen_materiel: 1,
                        accompagnement: 1,
                        global: 1,
                    }
                },
            })),
        ]);

        await generateActions(db);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.deepStrictEqual(action, {
            _id: 'F_XX_XX|AC_XX_XXXXXX',
            numero: 'AC_XX_XXXXXX',
            region: '11',
            code_region: '11',
            avis: [duplicatedAvis, uniqueAvis],
            score: {
                nb_avis: 2,
                notes: {
                    accueil: 3,
                    contenu_formation: 3,
                    equipe_formateurs: 3,
                    moyen_materiel: 3,
                    accompagnement: 3,
                    global: 3,
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
