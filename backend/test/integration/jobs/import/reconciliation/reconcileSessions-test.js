const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-db');
const { newComment } = require('../../../../helpers/data/dataset');
const reconcileSessions = require('../../../../../jobs/import/reconciliation/reconcileSessions');

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

        await reconcileSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.deepEqual(session, {
            _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
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
        });
    });

    it('should create session with empty avis list when no comment can be found', async () => {

        let db = await getTestDatabase();
        await importIntercarif();

        await reconcileSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.deepEqual(session, {
            _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
            numero: 'SE_XXXXXX',
            region: '11',
            score: {
                nb_avis: 0
            },
            meta: {
                reconciliation: {
                    organisme_formateur: '22222222222222',
                    lieu_de_formation: '75019',
                    formacodes: ['22403'],
                    certifinfos: ['80735']
                },
                source: {
                    type: 'intercarif',
                    numero_session: 'SE_XXXXXX',
                    numero_formation: 'F_XX_XX',
                    numero_action: 'AC_XX_XXXXXX',
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

        await reconcileSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.deepEqual(session, {
            _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
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

        await reconcileSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.deepEqual(session, {
            _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
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
        });
    });

    it('should reconcile comment without commentaire (null)', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', newComment({
                comment: null,
            })),
        ]);

        await reconcileSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.ok(session._id);
        assert.ok(session.meta.reconciliation);
        assert.ok(session.meta.source);
        assert.equal(session.avis, undefined);
    });

    it('should reconcile comment without commentaire (undefined)', async () => {

        let db = await getTestDatabase();
        let comment = newComment();
        delete comment.comment;

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', comment),
        ]);

        await reconcileSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.ok(session._id);
        assert.ok(session.meta.reconciliation);
        assert.ok(session.meta.source);
        assert.equal(session.avis, undefined);
    });


    it('should ignore not yet published comment', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', newComment({
                published: false,
            })),
        ]);

        await reconcileSessions(db);

        let session = await db.collection('sessionsReconciliees').findOne();
        assert.equal(session.avis, undefined);
        assert.ok(session._id);
        assert.ok(session.meta.reconciliation);
        assert.ok(session.meta.source);
    });

    it('should create indexes', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
        ]);

        await reconcileSessions(db);

        let indexes = await db.collection('sessionsReconciliees').indexInformation();
        assert.deepEqual(indexes, {
            '_id_': [['_id', 1]],
            'numero_1': [['numero', 1]],
            'region_1': [['region', 1]],
            'score.nb_avis_1': [['score.nb_avis', 1]],
        });
    });

}));
