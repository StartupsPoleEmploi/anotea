const request = require('supertest');
const assert = require('assert');
const _ = require('lodash');
const { withServer } = require('../../../helpers/with-server');
const { newStagiaire } = require('../../../helpers/data/dataset');


describe(__filename, withServer(({ startServer, getTestDatabase, insertIntoDatabase }) => {

    it('can submit a questionnaire', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let stagiaire = newStagiaire({}, date);
        await insertIntoDatabase('stagiaires', stagiaire);

        let response = await request(app)
        .post(`/api/questionnaire/${stagiaire.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            commentaire: {
                texte: 'texte',
                titre: 'titre'
            },
        });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(_.omit(response.body.stagiaire, ['_id', 'token']), {
            campaign: 'test-campaign',
            importDate: date.toJSON(),
            avisCreated: false,
            refreshKey: '667debb89cf76c83816e5f9dbc7c808e',
            individu: {
                nom: 'Dupont',
                prenom: 'Henri',
                email: 'henri@email.fr',
                telephones: [
                    '0123456789',
                    'NULL'
                ],
                emailValid: true,
                identifiant_pe: '1111111111'
            },
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur',
                domaine_formation: {
                    formacodes: ['46242'],
                },
                certifications: [{ certif_info: '78997' }],
                action: {
                    numero: 'AC_XX_XXXXXX',
                    lieu_de_formation: {
                        code_postal: '75011',
                        ville: 'Paris',
                    },
                    organisme_financeurs: [{
                        code_financeur: '10',
                    }],
                    organisme_formateur: {
                        raison_sociale: 'INSTITUT DE FORMATION',
                        label: 'Pole Emploi Formation',
                        siret: '11111111111111',
                        numero: '14_OF_XXXXXXXXXX',
                    },
                    session: {
                        id: '2422722',
                        nbStagiairesFormes: 5,
                        numero: 'SE_XXXXXX',
                        periode: {
                            debut: date.toJSON(),
                            fin: date.toJSON(),
                        },
                    },
                },
            },
            unsubscribe: false,
            mailSent: true,
            mailSentDate: date.toJSON(),
            tracking: {
                firstRead: date.toJSON()
            },
            codeRegion: '11',
            dispositifFinancement: 'AIF',
        });

        assert.deepStrictEqual(_.omit(response.body.infosRegion, ['stagiaire']), {
            showLinks: false,
            region: {
                nom: 'Île-de-France',
                codeRegion: '11',
                conseil_regional: {
                    active: true,
                    import: 'all',
                },
                contact: 'anotea-idf',
                active: true,
                since: '2016-05-01',
                departements: [
                    {
                        code: '91',
                        label: 'Essonne'
                    },
                    {
                        code: '92',
                        label: 'Hauts-de-Seine'
                    },
                    {
                        code: '75',
                        label: 'Paris'
                    },
                    {
                        code: '93',
                        label: 'Seine-Saint-Denis'
                    },
                    {
                        code: '77',
                        label: 'Seine-et-Marne'
                    },
                    {
                        code: '94',
                        label: 'Val-de-Marne'
                    },
                    {
                        code: '95',
                        label: 'Val-d\'Oise'
                    },
                    {
                        code: '78',
                        label: 'Yvelines'
                    }
                ],
                mailing: {
                    stagiaires: {
                        avis: true
                    },
                    organismes: {
                        accounts: true,
                        notifications: true
                    }
                },
                carif: {
                    nom: 'Défi Métiers',
                    url: 'https://www.defi-metiers.fr/',
                    active: true
                }
            }
        });

        let result = await db.collection('avis').findOne({ token: stagiaire.token });
        assert.ok(result.lastStatusUpdate);
        assert.deepStrictEqual(_.omit(result, ['token', '_id', 'date', 'lastStatusUpdate']), {
            campaign: 'test-campaign',
            refreshKey: '667debb89cf76c83816e5f9dbc7c808e',
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur',
                domaine_formation: {
                    formacodes: ['46242'],
                },
                certifications: [{ certif_info: '78997' }],
                action: {
                    numero: 'AC_XX_XXXXXX',
                    lieu_de_formation: {
                        code_postal: '75011',
                        ville: 'Paris',
                    },
                    organisme_financeurs: [{
                        code_financeur: '10',
                    }],
                    organisme_formateur: {
                        raison_sociale: 'INSTITUT DE FORMATION',
                        label: 'Pole Emploi Formation',
                        siret: '11111111111111',
                        numero: '14_OF_XXXXXXXXXX',
                    },
                    session: {
                        id: '2422722',
                        nbStagiairesFormes: 5,
                        numero: 'SE_XXXXXX',
                        periode: {
                            debut: date,
                            fin: date,
                        },
                    },
                },
            },
            codeRegion: '11',
            notes: {
                accueil: 2,
                contenu_formation: 2,
                equipe_formateurs: 1,
                moyen_materiel: 2,
                accompagnement: 2,
                global: 1.8,
            },
            commentaire: {
                title: 'titre',
                text: 'texte',
                titleMasked: false,
            },
            read: false,
            status: 'none',
            dispositifFinancement: 'AIF',
        });
    });

    it('can submit a questionnaire (notes)', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let stagiaire = newStagiaire({}, date);
        await insertIntoDatabase('stagiaires', stagiaire);

        let response = await request(app)
        .post(`/api/questionnaire/${stagiaire.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
        });

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('avis').findOne({ token: stagiaire.token });
        assert.ok(result.lastStatusUpdate);
        assert.deepStrictEqual(_.omit(result, ['token', '_id', 'date', 'lastStatusUpdate']), {
            campaign: 'test-campaign',
            refreshKey: '667debb89cf76c83816e5f9dbc7c808e',
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur',
                domaine_formation: {
                    formacodes: ['46242'],
                },
                certifications: [{ certif_info: '78997' }],
                action: {
                    numero: 'AC_XX_XXXXXX',
                    lieu_de_formation: {
                        code_postal: '75011',
                        ville: 'Paris',
                    },
                    organisme_financeurs: [{
                        code_financeur: '10',
                    }],
                    organisme_formateur: {
                        raison_sociale: 'INSTITUT DE FORMATION',
                        label: 'Pole Emploi Formation',
                        siret: '11111111111111',
                        numero: '14_OF_XXXXXXXXXX',
                    },
                    session: {
                        id: '2422722',
                        nbStagiairesFormes: 5,
                        numero: 'SE_XXXXXX',
                        periode: {
                            debut: date,
                            fin: date,
                        },
                    },
                },
            },
            codeRegion: '11',
            notes: {
                accueil: 2,
                contenu_formation: 2,
                equipe_formateurs: 1,
                moyen_materiel: 2,
                accompagnement: 2,
                global: 1.8,
            },
            read: false,
            status: 'validated',
            dispositifFinancement: 'AIF',
        });
    });

    it('can submit a questionnaire with empty commentaires (same as notes)', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let stagiaire = newStagiaire({}, date);
        await insertIntoDatabase('stagiaires', stagiaire);

        let response = await request(app)
        .post(`/api/questionnaire/${stagiaire.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            commentaire: {
                texte: '\u0020',
                titre: '  ',
            },
        });

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('avis').findOne({ token: stagiaire.token });
        assert.deepStrictEqual(result.commentaire, undefined);
        assert.deepStrictEqual(result.status, 'validated');
    });


    it('can submit a questionnaire with empty title (same as notes)', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let stagiaire = newStagiaire({}, date);
        await insertIntoDatabase('stagiaires', stagiaire);

        let response = await request(app)
        .post(`/api/questionnaire/${stagiaire.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            commentaire: {
            },
        });

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('avis').findOne({ token: stagiaire.token });
        assert.deepStrictEqual(result.commentaire, undefined);
        assert.deepStrictEqual(result.status, 'validated');
    });

    it('can submit a questionnaire with html', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let stagiaire = newStagiaire({}, date);
        await insertIntoDatabase('stagiaires', stagiaire);

        let response = await request(app)
        .post(`/api/questionnaire/${stagiaire.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            commentaire: {
                texte: '<div>coucou</div>\n',
                titre: '<script>alert(\'Il y a une faille XSS\')</script>'
            },
        });

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('avis').findOne({ token: stagiaire.token });
        assert.deepStrictEqual(result.commentaire, {
            text: 'coucou',
            title: '',
            titleMasked: false,
        });
    });

    it('can submit a questionnaire with encoded html', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let stagiaire = newStagiaire({}, date);
        await insertIntoDatabase('stagiaires', stagiaire);

        let response = await request(app)
        .post(`/api/questionnaire/${stagiaire.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            commentaire: {
                texte: '&lt;div&gt;coucou&lt;/div&gt;',
                titre: '&lt;script&gt;alert(\'Il y a une faille XSS\')&lt;/script&gt;'
            },
        });

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('avis').findOne({ token: stagiaire.token });
        assert.deepStrictEqual(result.commentaire, {
            text: 'coucou',
            title: '',
            titleMasked: false,
        });
    });

    it('can submit a questionnaire with emoji (:-))', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let stagiaire = newStagiaire({}, date);
        await insertIntoDatabase('stagiaires', stagiaire);

        let response = await request(app)
        .post(`/api/questionnaire/${stagiaire.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            commentaire: {
                texte: 'texte 😂',
                titre: 'titre'
            },
        });

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('avis').findOne({ token: stagiaire.token });
        assert.deepStrictEqual(result.commentaire.text, 'texte');
    });

    it('can not submit a questionnaire with invalid words', async () => {

        let app = await startServer();
        let date = new Date();
        let stagiaire = newStagiaire({}, date);
        await insertIntoDatabase('stagiaires', stagiaire);

        let response = await request(app)
        .post(`/api/questionnaire/${stagiaire.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            commentaire: {
                texte: 'Super connard',
                titre: 'titre'
            },
        });

        assert.strictEqual(response.statusCode, 400);
    });

    it('can not submit a questionnaire twice', async () => {

        let app = await startServer();
        let date = new Date();
        let stagiaire = newStagiaire({}, date);
        await insertIntoDatabase('stagiaires', stagiaire);

        let response = await request(app)
        .post(`/api/questionnaire/${stagiaire.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
        });
        assert.strictEqual(response.statusCode, 200);

        response = await request(app)
        .post(`/api/questionnaire/${stagiaire.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
        });
        assert.strictEqual(response.statusCode, 423);
    });

    it('can check badwords (invalid)', async () => {

        let app = await startServer();

        let response = await request(app)
        .get(`/api/questionnaire/checkBadwords?sentence=C'est de la merde.`);

        assert.strictEqual(response.statusCode, 400);
    });

    it('can check badwords (valid)', async () => {

        let app = await startServer();

        let response = await request(app)
        .get(`/api/questionnaire/checkBadwords?sentence=super formation`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            isGood: true
        });
    });

}));
