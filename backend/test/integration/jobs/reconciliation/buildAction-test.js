const assert = require('assert');
const logger = require('../../../helpers/components/fake-logger');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const { withMongoDB } = require('../../../helpers/with-mongodb');
const { newAvis } = require('../../../helpers/data/dataset');
const reconcile = require('../../../../src/jobs/reconciliation/tasks/reconcile');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    it('should reconcile actions with avis', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        let avisId = new ObjectID();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', newAvis({
                _id: avisId,
                token: 'token-1234',
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    certifications: [{ certif_info: '80735' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
            }, date)),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        delete action.meta.import_date;
        assert.deepStrictEqual(action, {
            _id: 'F_XX_XX|AC_XX_XXXXXX',
            numero: 'AC_XX_XXXXXX',
            region: '11',
            lieu_de_formation: {
                code_postal: '75019',
                ville: 'Paris'
            },
            organisme_financeurs: [{
                code_financeur: '2',
            }],
            organisme_formateur: {
                raison_sociale: 'Anotea Formation Paris',
                siret: '22222222222222',
                numero: 'OF_XXX'
            },
            avis: [
                {
                    _id: avisId,
                    date: date,
                    codeRegion: '11',
                    status: 'validated',
                    token: 'token-1234',
                    commentaire: {
                        title: 'Génial',
                        text: 'Super formation.',
                    },
                    notes: {
                        accueil: 3,
                        contenu_formation: 2,
                        equipe_formateurs: 4,
                        moyen_materiel: 2,
                        accompagnement: 1,
                        global: 2.4
                    },
                    formation: {
                        numero: 'F_XX_XX',
                        intitule: 'Développeur',
                        domaine_formation: {
                            formacodes: [
                                '22403'
                            ]
                        },
                        certifications: [
                            {
                                certif_info: '80735'
                            }
                        ],
                        action: {
                            numero: 'AC_XX_XXXXXX',
                            lieu_de_formation: {
                                code_postal: '75019',
                                ville: 'Paris'
                            },
                            organisme_financeurs: [{
                                code_financeur: '10',
                            }],
                            organisme_formateur: {
                                label: 'France Travail Formation',
                                raison_sociale: 'INSTITUT DE FORMATION',
                                siret: '22222222222222',
                                numero: '14_OF_XXXXXXXXXX'
                            },
                            session: {
                                id: '2422722',
                                numero: 'SE_XXXXXX',
                                periode: {
                                    debut: date,
                                    fin: date
                                }
                            }
                        }
                    }
                }
            ],
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    accompagnement: 1,
                    global: 2.4,
                },
                aggregation: {
                    global: {
                        max: 2.4,
                        min: 2.4,
                    }
                }
            },
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur web',
                objectif_formation: 'L\'objectif est d\'obtenir la qualification de développeur web, pour un accès à l\'emploi.',
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
            },
            meta: {
                source: {
                    numero_action: 'AC_XX_XXXXXX',
                    numero_formation: 'F_XX_XX',
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

    it('should reconcile actions with avis (certifications only)', async () => {

        let db = await getTestDatabase();
        let noCertification = newAvis({
            formation: {
                domaine_formation: {
                    formacodes: ['22403'],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '75019',
                    },
                    organisme_formateur: {
                        siret: '22222222222222',
                    },
                },
            },
        });
        noCertification.formation.certifications = [];

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', noCertification),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    certifications: [{ certif_info: '80735' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
            })),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.deepStrictEqual(action.avis.length, 1);
        assert.deepStrictEqual(action.avis[0].formation.certifications[0].certif_info, '80735');
    });

    it('should reconcile actions with avis (siren)', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', newAvis({
                _id: '1234',
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: '22222222244444',
                        },
                    },
                },
            })),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.deepStrictEqual(action.avis.length, 1);
        assert.deepStrictEqual(action.avis[0]._id, '1234');
    });

    it('should reconcile actions with avis (ignore archived)', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', newAvis({
                _id: '1234',
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: '22222222244444',
                        },
                    },
                },
                status: 'archived',
            })),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.deepStrictEqual(action.avis.length, 0);
    });

    it('should reconcile actions with avis (ville)', async () => {

        let db = await getTestDatabase();
        await importIntercarif();
        await Promise.all([
            db.collection('intercarif').updateMany(
                {},
                {
                    $set: {
                        'actions.0.lieu_de_formation.coordonnees.adresse.codepostal': '93100',
                        'actions.0.lieu_de_formation.coordonnees.adresse.ville': 'Montreuil',
                    }
                }
            ),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    action: {
                        lieu_de_formation: {
                            code_postal: '93100',
                            ville: 'Montreuil',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
            })),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    action: {
                        lieu_de_formation: {
                            code_postal: '93101',
                            ville: 'Montreuil',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
            })),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.deepStrictEqual(action.avis.length, 2);
    });

    it('should ignore no matching avis', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    certifications: [{ certif_info: '80735' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: 'XXXXXXXXXXXXXX',
                        },
                    },
                },
            })),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    domaine_formation: {
                        formacodes: ['XXXXX'],
                    },
                    certifications: [{ certif_info: 'YYYYY' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
            })),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    certifications: [{ certif_info: '80735' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75018',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
            })),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.strictEqual(action.avis.length, 0);
    });

    it('should ignore avis from other action', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    certifications: [{ certif_info: '80735' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: 'YYYYYYYYYYYYYY',
                        },
                    },
                },
            })),
        ]);

        let intercarif = await db.collection('intercarif').findOne();
        //Création d'une action dans la même formation mais dispensé par un autre organisme.
        let newAction = _.cloneDeep(intercarif.actions[0]);
        newAction._attributes.numero = 'AC_YY_YYYYYY';
        newAction.organisme_formateur.siret_formateur.siret = 'YYYYYYYYYYYYYY';
        newAction.sessions[0]._attributes.numero = 'SE_YYYYYY';
        await db.collection('intercarif').updateOne(
            {
                '_attributes.numero': 'F_XX_XX'
            },
            {
                $push: {
                    'actions': newAction
                }
            }
        );

        await reconcile(db, logger);

        let session = await db.collection('actionsReconciliees').findOne({ numero: 'AC_XX_XXXXXX' });
        assert.strictEqual(session.avis.length, 0);
    });

    it('should round notes during reconciliation', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    certifications: [{ certif_info: '80735' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
                notes: {
                    accueil: 1,
                    contenu_formation: 1,
                    equipe_formateurs: 3,
                    moyen_materiel: 4,
                    accompagnement: 5,
                    global: 5,
                },
            })),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    certifications: [{ certif_info: '80735' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
                notes: {
                    accueil: 1,
                    contenu_formation: 1,
                    equipe_formateurs: 4,
                    moyen_materiel: 5,
                    accompagnement: 5,
                    global: 5,
                },
            })),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    certifications: [{ certif_info: '80735' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
                notes: {
                    accueil: 2,
                    contenu_formation: 1,
                    equipe_formateurs: 1,
                    moyen_materiel: 5,
                    accompagnement: 1,
                    global: 3,
                },
            })),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.deepStrictEqual(action.score, {
            nb_avis: 3,
            notes: {
                accueil: 1.3,
                contenu_formation: 1,
                equipe_formateurs: 2.7,
                moyen_materiel: 4.7,
                accompagnement: 3.7,
                global: 4.3,
            },
            aggregation: {
                global: {
                    max: 5,
                    min: 3,
                }
            }
        });
    });

    it('should create session with empty avis list when no avis can be found', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.deepStrictEqual(action.score, { nb_avis: 0 });
        assert.deepStrictEqual(action.avis, []);
    });

    it('should reconcile comments with same formacode/siret/code_postal than the session', async () => {
        let db = await getTestDatabase();
        let oid = new ObjectID();
        let avis = newAvis({
            _id: oid,
            formation: {
                domaine_formation: {
                    formacodes: ['22403'],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '75019',
                    },
                    organisme_formateur: {
                        siret: '22222222222222',
                    },
                },
            },
        });
        avis.formation.certifications = [];

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', avis),
        ]);

        await reconcile(db, logger);

        let count = await db.collection('actionsReconciliees').countDocuments({ 'avis._id': oid });
        assert.strictEqual(count, 1);
    });

    it('should reconcile comments with same certifinfo/siret/code_postal than the session', async () => {

        let db = await getTestDatabase();
        let oid = new ObjectID();
        let avis = newAvis({
            _id: oid,
            formation: {
                certifications: [{ certif_info: '80735' }],
                action: {
                    lieu_de_formation: {
                        code_postal: '75019',
                    },
                    organisme_formateur: {
                        siret: '22222222222222',
                    },
                },
            },
        });
        avis.formation.domaine_formation.formacodes = [];

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', avis),
        ]);

        await reconcile(db, logger);

        let count = await db.collection('actionsReconciliees').countDocuments({ 'avis._id': oid });
        assert.strictEqual(count, 1);
    });

    it('should reconcile avis (notes)', async () => {

        let db = await getTestDatabase();
        let avis = newAvis({
            formation: {
                domaine_formation: {
                    formacodes: ['22403'],
                },
                certifications: [{ certif_info: '80735' }],
                action: {
                    lieu_de_formation: {
                        code_postal: '75019',
                    },
                    organisme_formateur: {
                        siret: '22222222222222',
                    },
                },
            },
            status: 'validated',
        });
        delete avis.commentaire;

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', avis),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.strictEqual(action.avis.length, 1);
        assert.strictEqual(action.avis[0].commentaire, undefined);
    });

    it('should ignore not yet validated avis', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', newAvis({
                status: 'none',
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    certifications: [{ certif_info: '80735' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
            })),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.deepStrictEqual(action.avis, []);
    });

    it('should reconcile rejected avis', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', newAvis({
                status: 'rejected',
                commentaire: {
                    title: 'WTF',
                    text: 'WTF',
                },
                formation: {
                    domaine_formation: {
                        formacodes: ['22403'],
                    },
                    certifications: [{ certif_info: '80735' }],
                    action: {
                        lieu_de_formation: {
                            code_postal: '75019',
                        },
                        organisme_formateur: {
                            siret: '22222222222222',
                        },
                    },
                },
            })),
        ]);

        await reconcile(db, logger);

        let action = await db.collection('actionsReconciliees').findOne();
        assert.strictEqual(action.avis.length, 1);
        assert.strictEqual(action.avis[0].commentaires, undefined);
    });
}));
