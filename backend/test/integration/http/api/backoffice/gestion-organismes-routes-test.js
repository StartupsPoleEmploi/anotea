const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');
const { newOrganismeAccount } = require('../../../../helpers/data/dataset');
const objectId = require('mongodb').ObjectId;

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur }) => {

    it('can search organismes avec id entier', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@francetravail.fr');
        let organisme = newOrganismeAccount({
            _id: '1234',
            siret: '11111111111111',
        });
        await insertIntoDatabase('accounts', organisme);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'me@francetravail.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            organismes: [
                {
                    _id: '1234',
                    siret: '11111111111111',
                    raison_sociale: 'France Travail Formation',
                    courriel: 'contact@poleemploi-formation.fr',
                    courriels: [
                        { courriel: 'contact@poleemploi-formation.fr', source: 'intercarif' },
                    ],
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
                            accueil: 5.1,
                            contenu_formation: 5.1,
                            equipe_formateurs: 4.1,
                            moyen_materiel: 3.1,
                            accompagnement: 4.1,
                            global: 5.1,
                        },
                        aggregation: {
                            global: {
                                max: 5.1,
                                min: 1,
                            },
                        },
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

    it('can search organismes avec id ObjectId', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@francetravail.fr');
        const idOrganisme = '5f43672078b3c84a55a0c305';
        let organisme = newOrganismeAccount({
            _id: await objectId(idOrganisme),
            siret: '11111111111111',
        });
        await insertIntoDatabase('accounts', organisme);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'me@francetravail.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            organismes: [
                {
                    _id: idOrganisme,
                    siret: '11111111111111',
                    raison_sociale: 'France Travail Formation',
                    courriel: 'contact@poleemploi-formation.fr',
                    courriels: [
                        { courriel: 'contact@poleemploi-formation.fr', source: 'intercarif' },
                    ],
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
                            accueil: 5.1,
                            contenu_formation: 5.1,
                            equipe_formateurs: 4.1,
                            moyen_materiel: 3.1,
                            accompagnement: 4.1,
                            global: 5.1,
                        },
                        aggregation: {
                            global: {
                                max: 5.1,
                                min: 1,
                            },
                        },
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
        let token = await logAsModerateur(app, 'admin@francetravail.fr');
        let actif = newOrganismeAccount({
            siret: '11111111111111',
            passwordHash: 'fake',
        });
        let inactif = newOrganismeAccount({
            siret: '33333333333333',
        });
        delete inactif.passwordHash;

        await Promise.all([
            insertIntoDatabase('accounts', actif),
            insertIntoDatabase('accounts', inactif),
        ]);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes?status=active`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'me@francetravail.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.organismes.length, 1);
        assert.deepStrictEqual(response.body.organismes[0]._id, 11111111111111);
        assert.deepStrictEqual(response.body.organismes[0].siret, '11111111111111');
    });

    it('can search organismes inactifs', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@francetravail.fr');
        let actif = newOrganismeAccount({
            siret: '11111111111111',
            passwordHash: 'fake',
        });
        let inactif = newOrganismeAccount({
            siret: '33333333333333',
        });
        delete inactif.passwordHash;

        await Promise.all([
            insertIntoDatabase('accounts', actif),
            insertIntoDatabase('accounts', inactif),
        ]);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes?status=inactive`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'me@francetravail.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.organismes.length, 1);
        assert.deepStrictEqual(response.body.organismes[0].siret, '33333333333333');
    });

    it('can search organismes by SIRET', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@francetravail.fr');
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '33333333333333',
            })),
        ]);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes?search=33333333333333`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'me@francetravail.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.organismes.length, 1);
        assert.deepStrictEqual(response.body.organismes[0].siret, '33333333333333');
    });

    it('can search organismes by raison sociale', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@francetravail.fr');
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111111,
                raison_sociale: 'Anotea',
            })),

            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 22222222222222,
                raison_sociale: 'anotea Misc',
            })),

            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 33333333333333,
                raison_sociale: 'France Travail',
            })),
        ]);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes?search=Anotea`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'me@francetravail.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.organismes.length, 2);
        assert.ok(response.body.organismes.find(o => o.siret, '11111111111111'));
        assert.ok(response.body.organismes.find(o => o.siret, '22222222222222'));
    });

    it('can search organismes by courriel', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@francetravail.fr');
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
                courriel: 'contact@anotea.fr',
            })),

            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '33333333333333',
                courriel: 'contact@poleemploi-formation.fr',
            })),
        ]);

        let response = await request(app)
        .get(`/api/backoffice/moderateur/organismes?search=contact@anotea.fr`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'me@francetravail.fr' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.organismes.length, 1);
        assert.deepStrictEqual(response.body.organismes[0].siret, '11111111111111');
    });

    it('can edit email (no duplicates) for int _id', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@francetravail.fr');

        const retourInsertion = await insertIntoDatabase('accounts', newOrganismeAccount({
            objectId: false,
        }));
        const organisme = retourInsertion.ops[0];

        let response = await request(app)
        .put(`/api/backoffice/moderateur/organismes/${organisme._id}/updateCourriel`)
        .set('authorization', `Bearer ${token}`)
        .send({ courriel: 'contact@poleemploi-formation.fr' });

        assert.strictEqual(response.statusCode, 201);
        assert.deepStrictEqual(response.body.courriel, 'contact@poleemploi-formation.fr');
        assert.deepStrictEqual(response.body.courriels, [
            { courriel: 'contact@poleemploi-formation.fr', source: 'intercarif' },
        ]);
    });

    it('can edit email (no duplicates) for string _id', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@francetravail.fr');

        const monInsert = await insertIntoDatabase('accounts', newOrganismeAccount({
            objectId: true,
        }));
        const organisme = monInsert.ops[0];

        let response = await request(app)
        .put(`/api/backoffice/moderateur/organismes/${organisme._id}/updateCourriel`)
        .set('authorization', `Bearer ${token}`)
        .send({ courriel: 'contact@poleemploi-formation.fr' });

        assert.strictEqual(response.statusCode, 201);
        assert.deepStrictEqual(response.body.courriel, 'contact@poleemploi-formation.fr');
        assert.deepStrictEqual(response.body.courriels, [
            { courriel: 'contact@poleemploi-formation.fr', source: 'intercarif' },
        ]);
    });

    it('can resend email password for int _id', async () => {
        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@francetravail.fr');
        let organisme = newOrganismeAccount({
            siret: '11111111111111',
        });
        await insertIntoDatabase('accounts', organisme);
        
        let response = await request(app)
        .post(`/api/backoffice/moderateur/organismes/11111111111111/resendEmailAccount`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'me@francetravail.fr' });

        assert.strictEqual(response.statusCode, 200);
    });

    it('can resend email password for ObjectId _id', async () => {
        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@francetravail.fr');
        let organisme = newOrganismeAccount({
            objectId: true,
            siret: '11111111111111',
        });
        await insertIntoDatabase('accounts', organisme);
        
        let response = await request(app)
        .post(`/api/backoffice/moderateur/organismes/${organisme._id}/resendEmailAccount`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'me@francetravail.fr' });

        assert.strictEqual(response.statusCode, 200);
    });
}));
