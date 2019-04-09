const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newComment } = require('../../../../helpers/data/dataset');
const generateSessions = require('../../../../../src/jobs/import/formations/generateSessions');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    it('should reconcile sessions with comments', async () => {

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
            insertIntoDatabase('comment', comment),
        ]);

        await generateSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.deepStrictEqual(session, {
            _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
            numero: 'SE_XXXXXX',
            region: '11',
            code_region: '11',
            avis: [comment],
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    accompagnement: 1,
                    global: 2.4,
                }
            },
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur web',
                domaine_formation: {
                    formacodes: ['22403']
                },
                certifications: {
                    certifinfos: ['80735']
                },
                organisme_responsable: {
                    numero: 'OR_XX_XXX',
                    raison_sociale: 'Centre de formation Anotéa',
                    siret: '11111111111111',
                },
                action: {
                    numero: 'AC_XX_XXXXXX',
                    lieu_de_formation: {
                        code_postal: '75019',
                        ville: 'Paris'
                    },
                    organisme_financeurs: [
                        '2'
                    ],
                    organisme_formateur: {
                        raison_sociale: 'Anotea Formation Paris',
                        siret: '22222222222222',
                        numero: 'OF_XXX'
                    }
                }
            },
            meta: {
                source: {
                    numero_action: 'AC_XX_XXXXXX',
                    numero_formation: 'F_XX_XX',
                    numero_session: 'SE_XXXXXX',
                    type: 'intercarif',
                },
                reconciliation: {
                    organisme_formateur: '22222222222222',
                    lieu_de_formation: '75019',
                    certifinfos: ['80735'],
                    formacodes: ['22403']
                },
            }
        });
    });


    it('should round notes during reconcile', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', newComment({
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
                },
                rates: {
                    accueil: 1,
                    contenu_formation: 1,
                    equipe_formateurs: 3,
                    moyen_materiel: 4,
                    accompagnement: 5,
                    global: 5,
                },
            })),
            insertIntoDatabase('comment', newComment({
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
                },
                rates: {
                    accueil: 1,
                    contenu_formation: 1,
                    equipe_formateurs: 4,
                    moyen_materiel: 5,
                    accompagnement: 5,
                    global: 5,
                },
            })),
            insertIntoDatabase('comment', newComment({
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
                },
                rates: {
                    accueil: 2,
                    contenu_formation: 1,
                    equipe_formateurs: 1,
                    moyen_materiel: 5,
                    accompagnement: 1,
                    global: 5,
                },
            })),
        ]);

        await generateSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.deepStrictEqual(session.score, {
            nb_avis: 3,
            notes: {
                accueil: 1.3,
                contenu_formation: 1,
                equipe_formateurs: 2.7,
                moyen_materiel: 4.7,
                accompagnement: 3.7,
                global: 5,
            }
        });
    });

    it('should create session with empty avis list when no comment can be found', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
        ]);

        await generateSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.deepStrictEqual(session, {
            _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
            numero: 'SE_XXXXXX',
            region: '11',
            code_region: '11',
            avis: [],
            score: {
                nb_avis: 0
            },
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur web',
                domaine_formation: {
                    formacodes: ['22403']
                },
                certifications: {
                    certifinfos: ['80735']
                },
                organisme_responsable: {
                    numero: 'OR_XX_XXX',
                    raison_sociale: 'Centre de formation Anotéa',
                    siret: '11111111111111',
                },
                action: {
                    numero: 'AC_XX_XXXXXX',
                    lieu_de_formation: {
                        code_postal: '75019',
                        ville: 'Paris'
                    },
                    organisme_financeurs: [
                        '2'
                    ],
                    organisme_formateur: {
                        raison_sociale: 'Anotea Formation Paris',
                        siret: '22222222222222',
                        numero: 'OF_XXX'
                    }
                }
            },
            meta: {
                source: {
                    numero_action: 'AC_XX_XXXXXX',
                    numero_formation: 'F_XX_XX',
                    numero_session: 'SE_XXXXXX',
                    type: 'intercarif',
                },
                reconciliation: {
                    organisme_formateur: '22222222222222',
                    lieu_de_formation: '75019',
                    formacodes: ['22403'],
                    certifinfos: ['80735']
                },
            },
        });
    });

    it('should reconcile comments with same formace/siret/code_postal than the session', async () => {
        let db = await getTestDatabase();
        let date = new Date();
        let comment = newComment({
            formacode: '22403',
            training: {
                formacode: '22403',
                certifInfo: null,
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
            insertIntoDatabase('comment', comment),
        ]);

        await generateSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.deepStrictEqual(session, {
            _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
            numero: 'SE_XXXXXX',
            region: '11',
            code_region: '11',
            avis: [comment],
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    accompagnement: 1,
                    global: 2.4,
                }
            },
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur web',
                domaine_formation: {
                    formacodes: ['22403']
                },
                certifications: {
                    certifinfos: ['80735']
                },
                organisme_responsable: {
                    numero: 'OR_XX_XXX',
                    raison_sociale: 'Centre de formation Anotéa',
                    siret: '11111111111111',
                },
                action: {
                    numero: 'AC_XX_XXXXXX',
                    lieu_de_formation: {
                        code_postal: '75019',
                        ville: 'Paris'
                    },
                    organisme_financeurs: [
                        '2'
                    ],
                    organisme_formateur: {
                        raison_sociale: 'Anotea Formation Paris',
                        siret: '22222222222222',
                        numero: 'OF_XXX'
                    }
                }
            },
            meta: {
                source: {
                    numero_action: 'AC_XX_XXXXXX',
                    numero_formation: 'F_XX_XX',
                    numero_session: 'SE_XXXXXX',
                    type: 'intercarif',
                },
                reconciliation: {
                    organisme_formateur: '22222222222222',
                    lieu_de_formation: '75019',
                    certifinfos: ['80735'],
                    formacodes: ['22403']
                },
            }
        });
    });

    it('should reconcile comments with same certifinfo/siret/code_postal than the session', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        let comment = newComment({
            formacode: null,
            training: {
                formacode: null,
                certifInfo: { id: '80735' },
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
            insertIntoDatabase('comment', comment),
        ]);

        await generateSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.deepStrictEqual(session, {
            _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
            numero: 'SE_XXXXXX',
            region: '11',
            code_region: '11',
            avis: [comment],
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    accompagnement: 1,
                    global: 2.4,
                }
            },
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur web',
                domaine_formation: {
                    formacodes: ['22403']
                },
                certifications: {
                    certifinfos: ['80735']
                },
                organisme_responsable: {
                    numero: 'OR_XX_XXX',
                    raison_sociale: 'Centre de formation Anotéa',
                    siret: '11111111111111',
                },
                action: {
                    numero: 'AC_XX_XXXXXX',
                    lieu_de_formation: {
                        code_postal: '75019',
                        ville: 'Paris'
                    },
                    organisme_financeurs: [
                        '2'
                    ],
                    organisme_formateur: {
                        raison_sociale: 'Anotea Formation Paris',
                        siret: '22222222222222',
                        numero: 'OF_XXX'
                    }
                }
            },
            meta: {
                source: {
                    numero_action: 'AC_XX_XXXXXX',
                    numero_formation: 'F_XX_XX',
                    numero_session: 'SE_XXXXXX',
                    type: 'intercarif',
                },
                reconciliation: {
                    organisme_formateur: '22222222222222',
                    lieu_de_formation: '75019',
                    certifinfos: ['80735'],
                    formacodes: ['22403']
                },
            }
        });
    });

    it('should reconcile comment without commentaire (null)', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', newComment({
                comment: null,
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
                },
            })),
        ]);

        await generateSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.equal(session.avis.length, 1);
        assert.equal(session.avis[0].comment, undefined);
    });

    it('should reconcile comment without commentaire (undefined)', async () => {

        let db = await getTestDatabase();
        let comment = newComment({
            comment: undefined,
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
            },
        });
        delete comment.comment;

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', comment),
        ]);

        await generateSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.strictEqual(session.avis.length, 1);
        assert.equal(session.avis[0].comment, undefined);
    });

    it('should ignore not yet published comment', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', newComment({
                published: false,
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
                },
            })),
        ]);

        await generateSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.deepStrictEqual(session.avis, []);
    });

    it('should reconcile rejected comment', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', newComment({
                published: false,
                rejected: true,
                comment: {
                    title: 'WTF',
                    text: 'WTF',
                },
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
                },
            })),
        ]);

        await generateSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.strictEqual(session.avis.length, 1);
        assert.strictEqual(session.avis[0].rejected, true);
    });
}));
