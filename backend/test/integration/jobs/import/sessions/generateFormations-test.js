const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newComment } = require('../../../../helpers/data/dataset');
const generateFormations = require('../../../../../src/jobs/import/formations/generateFormations');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    it('should reconcile formation with comments', async () => {

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

        await generateFormations(db);

        let session = await db.collection('formationsReconciliees').findOne();
        assert.deepStrictEqual(session, {
            _id: 'F_XX_XX',
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
                source: 'intercarif',
                reconciliation: {
                    organisme_formateurs: ['22222222222222'],
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

        await generateFormations(db);

        let session = await db.collection('formationsReconciliees').findOne();
        assert.deepStrictEqual(session.score, {
            nb_avis: 3,
            notes: {
                accueil: 1,
                contenu_formation: 1,
                equipe_formateurs: 3,
                moyen_materiel: 5,
                accompagnement: 4,
                global: 5,
            }
        });
    });

    it('should create session with empty avis list when no comment can be found', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
        ]);

        await generateFormations(db);

        let session = await db.collection('formationsReconciliees').findOne();
        assert.deepStrictEqual(session, {
            _id: 'F_XX_XX',
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
            avis: [],
            score: {
                nb_avis: 0
            },
            meta: {
                source: 'intercarif',
                reconciliation: {
                    organisme_formateurs: ['22222222222222'],
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

        await generateFormations(db);

        let session = await db.collection('formationsReconciliees').findOne();
        assert.deepStrictEqual(session, {
            _id: 'F_XX_XX',
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
                source: 'intercarif',
                reconciliation: {
                    organisme_formateurs: ['22222222222222'],
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

        await generateFormations(db);

        let session = await db.collection('formationsReconciliees').findOne();
        assert.deepStrictEqual(session, {
            _id: 'F_XX_XX',
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
                source: 'intercarif',
                reconciliation: {
                    organisme_formateurs: ['22222222222222'],
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

        await generateFormations(db);

        let session = await db.collection('formationsReconciliees').findOne();
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

        await generateFormations(db);

        let session = await db.collection('formationsReconciliees').findOne();
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

        await generateFormations(db);

        let session = await db.collection('formationsReconciliees').findOne();
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

        await generateFormations(db);

        let session = await db.collection('formationsReconciliees').findOne();
        assert.strictEqual(session.avis.length, 1);
        assert.strictEqual(session.avis[0].rejected, true);
    });
}));
