const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const { newOrganismeAccount } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getTestDatabase, logAsModerateur }) => {

    it('can search organismes', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        let organisme = newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            meta: {
                siretAsString: '11111111111111'
            },
        });
        await insertIntoDatabase('accounts', organisme);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'edited@pole-emploi.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            organismes: [
                {
                    _id: 11111111111111,
                    SIRET: 11111111111111,
                    raisonSociale: 'Pole Emploi Formation',
                    courriel: 'contact@poleemploi-formation.fr',
                    creationDate: organisme.creationDate.toJSON(),
                    mailSentDate: organisme.mailSentDate.toJSON(),
                    codeRegion: '11',
                    numero: '14_OF_0000000123',
                    status: 'active',
                    lieux_de_formation: [
                        {
                            adresse: {
                                code_postal: '75019',
                                ville: 'Paris 19e',
                                region: '11'
                            }
                        }
                    ],
                    score: {
                        nb_avis: 15,
                        notes: {
                            accueil: 5,
                            contenu_formation: 5,
                            equipe_formateurs: 4,
                            moyen_materiel: 3,
                            accompagnement: 4,
                            global: 5
                        }
                    },
                    meta: {
                        siretAsString: '11111111111111'
                    },
                    profile: 'organisme'
                }
            ],
            meta: {
                pagination: {
                    page: 0,
                    itemsPerPage: 2,
                    itemsOnThisPage: 1,
                    totalItems: 1,
                    totalPages: 1
                }
            }
        });
    });


    it('can search organismes actifs', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        let actif = newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            meta: {
                siretAsString: '11111111111111'
            },
            passwordHash: '$2b$10$9kI8ub4e/yw51/nWF8IlOuGQRjvvgVIPfsLB/aKuAXlIuiiyLy/4C',
        });
        let inactif = newOrganismeAccount({
            _id: 33333333333333,
            SIRET: 33333333333333,
            meta: {
                siretAsString: '33333333333333'
            },
        });
        delete inactif.passwordHash;

        await Promise.all([
            insertIntoDatabase('accounts', actif),
            insertIntoDatabase('accounts', inactif),
        ]);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes?status=active`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'edited@pole-emploi.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.organismes.length, 1);
        assert.deepStrictEqual(response.body.organismes[0]._id, 11111111111111);
    });

    it('can search organismes inactifs', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        let actif = newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            meta: {
                siretAsString: '11111111111111'
            },
            passwordHash: '$2b$10$9kI8ub4e/yw51/nWF8IlOuGQRjvvgVIPfsLB/aKuAXlIuiiyLy/4C',
        });
        let inactif = newOrganismeAccount({
            _id: 33333333333333,
            SIRET: 33333333333333,
            meta: {
                siretAsString: '33333333333333'
            },
        });
        delete inactif.passwordHash;

        await Promise.all([
            insertIntoDatabase('accounts', actif),
            insertIntoDatabase('accounts', inactif),
        ]);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes?status=inactive`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'edited@pole-emploi.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.organismes.length, 1);
        assert.deepStrictEqual(response.body.organismes[0]._id, 33333333333333);
    });

    it('can search organismes by SIRET', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111111,
                SIRET: 11111111111111,
                meta: {
                    siretAsString: '11111111111111'
                },
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 33333333333333,
                SIRET: 33333333333333,
                meta: {
                    siretAsString: '33333333333333'
                },
            })),
        ]);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes?search=33333333333333`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'edited@pole-emploi.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.organismes.length, 1);
        assert.deepStrictEqual(response.body.organismes[0]._id, 33333333333333);
    });

    it('can search organismes by raison sociale', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111111,
                raisonSociale: 'Anotea',
            })),

            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 22222222222222,
                raisonSociale: 'anotea Misc',
            })),

            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 33333333333333,
                raisonSociale: 'Pole Emploi',
            })),
        ]);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes?search=Anotea`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'edited@pole-emploi.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.organismes.length, 2);
        assert.deepStrictEqual(response.body.organismes[0]._id, 11111111111111);
        assert.deepStrictEqual(response.body.organismes[1]._id, 22222222222222);
    });

    it('can search organismes by courriel', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111111,
                courriel: 'contact@anotea.fr',
            })),

            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 33333333333333,
                courriel: 'contact@poleemploi-formation.fr',
            })),
        ]);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes?search=contact@anotea.fr`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'edited@pole-emploi.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.organismes.length, 1);
        assert.deepStrictEqual(response.body.organismes[0]._id, 11111111111111);
    });

    it('can edit email', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        let id = 11111111111111;

        await insertIntoDatabase('accounts', newOrganismeAccount({
            _id: id,
            SIRET: id,
            meta: {
                siretAsString: '11111111111111'
            },
        }));

        let response = await request(app)
        .put(`/api/backoffice/moderateur/organismes/${id}/updateEditedCourriel`)
        .set('authorization', `Bearer ${token}`)
        .send({ courriel: 'edited@pole-emploi.fr' });

        assert.strictEqual(response.statusCode, 201);
        assert.deepStrictEqual(response.body.editedCourriel, 'edited@pole-emploi.fr');
    });

    it('can delete an edited email', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        let id = 11111111111111;

        await insertIntoDatabase('accounts', newOrganismeAccount({
            _id: id,
            SIRET: id,
            editedCourriel: 'edited@pole-emploi.fr',
            meta: {
                siretAsString: '11111111111111'
            },
        }));

        let response = await request(app)
        .put(`/api/backoffice/moderateur/organismes/${id}/removeEditedCourriel`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, { 'status': 'OK' });

        let db = await getTestDatabase();
        let res = await db.collection('accounts').findOne({ _id: id });
        assert.ok(!res.editedCourriel);
    });
}));
