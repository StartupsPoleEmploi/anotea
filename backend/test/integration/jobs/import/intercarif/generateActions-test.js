const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-db');
const { newComment } = require('../../../../helpers/data/dataset');
const generateActions = require('../../../../../jobs/import/intercarif/steps/generateActions');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    it('should generate actions from sessions', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        let comment = newComment({
            formacode: '22403',
            training: {
                formacode: '22403',
                certifInfo: {
                    id: '80735',
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
            insertIntoDatabase('sessionsReconciliees', {
                _id: 'F_XX_XX|AC_XX_XXXXXX',
                numero: 'SE_XXXXXX',
                region: '11',
                avis: [comment],
                score: {
                    nb_avis: 1,
                    notes: {
                        accueil: 3,
                        contenu_formation: 2,
                        equipe_formateurs: 4,
                        moyen_materiel: 2,
                        accompagnement: 1,
                        global: 2
                    }
                },
                meta: {
                    reconciliation: {
                        organisme_formateur: '22222222222222',
                        lieu_de_formation: '75019',
                        certifinfos: [
                            '80735'
                        ],
                        formacodes: [
                            '22403'
                        ]
                    },
                    source: {
                        type: 'intercarif',
                        numero_session: 'SE_XXXXXX',
                        numero_formation: 'F_XX_XX',
                        numero_action: 'AC_XX_XXXXXX',
                    }
                }
            }),
        ]);

        await generateActions(db);

        let session = await db.collection('actionsReconciliees').findOne();
        assert.deepEqual(session, {
            _id: 'F_XX_XX|AC_XX_XXXXXX',
            numero: 'AC_XX_XXXXXX',
            numero_formation: 'F_XX_XX',
            region: '11',
            avis: [comment],
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    accompagnement: 1,
                    global: 2
                }
            },
            meta: {
                reconciliation: {
                    organisme_formateur: '22222222222222',
                    lieu_de_formation: '75019',
                    certifinfos: [
                        '80735'
                    ],
                    formacodes: [
                        '22403'
                    ]
                },
                source: {
                    type: 'intercarif',
                    numero_formation: 'F_XX_XX',
                    numero_action: 'AC_XX_XXXXXX',
                }
            }
        });
    });
}));
