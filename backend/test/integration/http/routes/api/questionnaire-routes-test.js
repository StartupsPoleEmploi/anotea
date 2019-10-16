const request = require('supertest');
const assert = require('assert');
const _ = require('lodash');
const { withServer } = require('../../../../helpers/with-server');
const { newTrainee } = require('../../../../helpers/data/dataset');


describe(__filename, withServer(({ startServer, getTestDatabase, insertIntoDatabase }) => {

    it('can submit a questionnaire', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let trainee = newTrainee({}, date);
        await insertIntoDatabase('trainee', trainee);

        let response = await request(app)
        .post(`/api/questionnaire/${trainee.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            pseudo: 'John D.',
            commentaire: {
                texte: 'texte',
                titre: 'titre'
            },
            accord: true,
            accordEntreprise: true,
        });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(_.omit(response.body.stagiaire, ['_id', 'token']), {
            campaign: 'test-campaign',
            importDate: date.toJSON(),
            avisCreated: false,
            trainee: {
                name: 'Dupont',
                firstName: 'Henri',
                mailDomain: 'free.fr',
                email: 'henri@email.fr',
                phoneNumbers: [
                    '0123456789',
                    'NULL'
                ],
                emailValid: true,
                dnIndividuNational: '1111111111'
            },
            training: {
                idFormation: 'F_XX_XX',
                title: 'Développeur',
                startDate: date.toJSON(),
                scheduledEndDate: date.toJSON(),
                organisation: {
                    id: '14_OF_XXXXXXXXXX',
                    siret: '11111111111111',
                    label: 'Pole Emploi Formation',
                    name: 'INSTITUT DE FORMATION'
                },
                place: {
                    postalCode: '75011',
                    city: 'Paris'
                },
                certifInfo: {
                    id: '78997',
                    label: 'Développeur'
                },
                idSession: '2422722',
                formacode: '46242',
                infoCarif: {
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX'
                },
                codeFinanceur: '10'
            },
            unsubscribe: false,
            mailSent: true,
            avisCreated: false,
            mailSentDate: date.toJSON(),
            tracking: {
                firstRead: date.toJSON()
            },
            codeRegion: '11',
        });

        assert.deepStrictEqual(_.omit(response.body.infosRegion, ['trainee']), {
            showLinks: false,
            region: {
                nom: 'Île-de-France',
                codeRegion: '11',
                codeINSEE: '11',
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

        let result = await db.collection('comment').findOne({ token: trainee.token });
        assert.ok(result.lastStatusUpdate);
        assert.deepStrictEqual(_.omit(result, ['token', '_id', 'date', 'lastStatusUpdate']), {
            campaign: 'test-campaign',
            training: {
                idFormation: 'F_XX_XX',
                title: 'Développeur',
                startDate: date,
                scheduledEndDate: date,
                organisation: {
                    id: '14_OF_XXXXXXXXXX',
                    siret: '11111111111111',
                    label: 'Pole Emploi Formation',
                    name: 'INSTITUT DE FORMATION'
                },
                place: {
                    postalCode: '75011',
                    city: 'Paris'
                },
                certifInfo: {
                    id: '78997',
                    label: 'Développeur'
                },
                idSession: '2422722',
                formacode: '46242',
                infoCarif: {
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX'
                },
                codeFinanceur: '10'
            },
            codeRegion: '11',
            rates: {
                accueil: 2,
                contenu_formation: 2,
                equipe_formateurs: 1,
                moyen_materiel: 2,
                accompagnement: 2,
                global: 1.8,
            },
            pseudo: 'JohnD',
            comment: {
                title: 'titre',
                text: 'texte',
                titleMasked: false,
            },
            accord: true,
            accordEntreprise: true,
            read: false,
            status: 'none',
        });
    });

    it('can submit a questionnaire (notes)', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let trainee = newTrainee({}, date);
        await insertIntoDatabase('trainee', trainee);

        let response = await request(app)
        .post(`/api/questionnaire/${trainee.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            pseudo: 'John D.',
            accord: true,
            accordEntreprise: true,
        });

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('comment').findOne({ token: trainee.token });
        assert.ok(result.lastStatusUpdate);
        assert.deepStrictEqual(_.omit(result, ['token', '_id', 'date', 'lastStatusUpdate']), {
            campaign: 'test-campaign',
            training: {
                idFormation: 'F_XX_XX',
                title: 'Développeur',
                startDate: date,
                scheduledEndDate: date,
                organisation: {
                    id: '14_OF_XXXXXXXXXX',
                    siret: '11111111111111',
                    label: 'Pole Emploi Formation',
                    name: 'INSTITUT DE FORMATION'
                },
                place: {
                    postalCode: '75011',
                    city: 'Paris'
                },
                certifInfo: {
                    id: '78997',
                    label: 'Développeur'
                },
                idSession: '2422722',
                formacode: '46242',
                infoCarif: {
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX'
                },
                codeFinanceur: '10'
            },
            codeRegion: '11',
            rates: {
                accueil: 2,
                contenu_formation: 2,
                equipe_formateurs: 1,
                moyen_materiel: 2,
                accompagnement: 2,
                global: 1.8,
            },
            pseudo: 'JohnD',
            accord: true,
            accordEntreprise: true,
            read: false,
            status: 'published',
        });
    });

    it('can submit a questionnaire with emoji (:-))', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let trainee = newTrainee({}, date);
        await insertIntoDatabase('trainee', trainee);

        let response = await request(app)
        .post(`/api/questionnaire/${trainee.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            pseudo: 'John D.',
            accord: true,
            accordEntreprise: true,
            commentaire: {
                texte: 'texte 😂',
                titre: 'titre'
            },
        });

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('comment').findOne({ token: trainee.token });
        assert.deepStrictEqual(result.comment.text, 'texte');
    });

    it('can not submit a questionnaire with invalid words', async () => {

        let app = await startServer();
        let date = new Date();
        let trainee = newTrainee({}, date);
        await insertIntoDatabase('trainee', trainee);

        let response = await request(app)
        .post(`/api/questionnaire/${trainee.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            pseudo: '',
            commentaire: {
                texte: 'Super connard',
                titre: 'titre'
            },
            accord: true,
            accordEntreprise: true,
        });

        assert.strictEqual(response.statusCode, 400);
    });

    it('can not submit a questionnaire twice', async () => {

        let app = await startServer();
        let date = new Date();
        let trainee = newTrainee({}, date);
        await insertIntoDatabase('trainee', trainee);

        let response = await request(app)
        .post(`/api/questionnaire/${trainee.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            pseudo: 'John D.',
            accord: true,
            accordEntreprise: true,
        });
        assert.strictEqual(response.statusCode, 200);

        response = await request(app)
        .post(`/api/questionnaire/${trainee.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            pseudo: 'John D.',
            accord: true,
            accordEntreprise: true,
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
