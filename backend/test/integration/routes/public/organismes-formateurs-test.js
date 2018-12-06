const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../helpers/test-server');
const { newOrganismeAccount } = require('../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase }) => {

    const buildOrganismeAccount = siret => {
        return newOrganismeAccount({
            _id: parseInt(siret),
            SIRET: parseInt(siret),
            meta: {
                siretAsString: siret
            },
        });
    };

    it('can return organisme by id', async () => {

        let app = await startServer();
        let siret = '22222222222222';
        await insertIntoDatabase('organismes', buildOrganismeAccount(siret));

        let response = await request(app).get(`/api/v1/organismes-formateurs/${siret}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            id: siret,
            siret: siret,
            numero: '14_OF_0000000123',
            raison_sociale: 'Pole Emploi Formation',
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
            }
        });
    });

    it('should fail when id is unknown', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/organismes-formateurs/UNKNOWN`);

        assert.equal(response.statusCode, 404);
        assert.deepEqual(response.body, {
            error: 'Not Found',
            message: 'Identifiant inconnu',
            statusCode: 404,
        });
    });

    it('can search trough all organismes', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('organismes', buildOrganismeAccount('11111111111111')),
            insertIntoDatabase('organismes', buildOrganismeAccount('22222222222222')),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs');

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.organismes_formateurs.length, 2);
        assert.ok(response.body.organismes_formateurs.find(of => of.id === '11111111111111'));
        assert.ok(response.body.organismes_formateurs.find(of => of.id === '22222222222222'));
    });

    it('can search though all organismes filtered by ids', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('organismes', buildOrganismeAccount('11111111111111')),
            insertIntoDatabase('organismes', buildOrganismeAccount('22222222222222')),
            insertIntoDatabase('organismes', buildOrganismeAccount('33333333333333')),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?id=11111111111111,22222222222222`);

        assert.equal(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.equal(organismes.length, 2);
        assert.ok(organismes.find(s => s.id === '11111111111111'));
        assert.ok(organismes.find(s => s.id === '22222222222222'));
    });

    it('can search though all organismes filtered by numero', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({ _id: 11111111111111, numero: 'OF_XX1' })),
            insertIntoDatabase('organismes', newOrganismeAccount({ _id: 22222222222222, numero: 'OF_XX2' })),
            insertIntoDatabase('organismes', newOrganismeAccount({ _id: 33333333333333, numero: 'OF_XX3' })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?numero=OF_XX1,OF_XX2`);

        assert.equal(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.equal(organismes.length, 2);
        assert.ok(organismes.find(s => s.numero === 'OF_XX1'));
        assert.ok(organismes.find(s => s.numero === 'OF_XX2'));
    });

    it('can search though all organismes filtered by siret', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('organismes', buildOrganismeAccount('11111111111111')),
            insertIntoDatabase('organismes', buildOrganismeAccount('22222222222222')),
            insertIntoDatabase('organismes', buildOrganismeAccount('33333333333333')),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?siret=11111111111111,22222222222222`);

        assert.equal(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.equal(organismes.length, 2);
        assert.ok(organismes.find(s => s.siret === '11111111111111'));
        assert.ok(organismes.find(s => s.siret === '22222222222222'));
    });

    it('can search though all organismes filtered by nb_avis', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: '11111111111111',
                score: {
                    nb_avis: 1,
                }
            })),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: '22222222222222',
                score: {
                    nb_avis: 0,
                }
            })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?nb_avis=1`);

        assert.equal(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.equal(organismes.length, 1);
        assert.ok(organismes.find(s => s.id === '11111111111111'));
    });

    it('can search though all organismes filtered by lieu_de_formation (region)', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: '11111111111111',
                lieux_de_formation: [
                    {
                        adresse: {
                            code_postal: '75011',
                            ville: 'Paris 11e',
                            region: '11'
                        }
                    }
                ],
            })),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: '22222222222222',
                lieux_de_formation: [
                    {
                        adresse: {
                            code_postal: '45000',
                            ville: 'Nantes',
                            region: '24'
                        }
                    }
                ],
            })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?lieu_de_formation=11`);

        assert.equal(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.equal(organismes.length, 1);
        assert.ok(organismes.find(s => s.id === '11111111111111'));
    });


    it('can search though all organismes filtered by lieu_de_formation (code_postal)', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: '11111111111111',
                lieux_de_formation: [
                    {
                        adresse: {
                            code_postal: '75011',
                            ville: 'Paris 11e',
                            region: '11'
                        }
                    }
                ],
            })),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: '22222222222222',
                lieux_de_formation: [
                    {
                        adresse: {
                            code_postal: '45000',
                            ville: 'Nantes',
                            region: '24'
                        }
                    }
                ],
            })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?lieu_de_formation=45000`);

        assert.equal(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.equal(organismes.length, 1);
        assert.ok(organismes.find(s => s.id === '22222222222222'));
    });

    it('can search though all sessions with pagination', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('organismes', buildOrganismeAccount('11111111111111')),
            insertIntoDatabase('organismes', buildOrganismeAccount('22222222222222')),
            insertIntoDatabase('organismes', buildOrganismeAccount('33333333333333')),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?page=0&items_par_page=1`);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.organismes_formateurs.length, 1);

        response = await request(app).get(`/api/v1/organismes-formateurs?page=1&items_par_page=1`);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.organismes_formateurs.length, 1);
        assert.deepEqual(response.body.meta.pagination, {
            page: 1,
            items_par_page: 1,
            total_items: 3,
            total_pages: 3,
        });
    });

    it('can search though all sessions with projection (blacklist)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('organismes', buildOrganismeAccount('11111111111111')),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs?fields=-lieux_de_formation');
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.organismes_formateurs.length, 1);
        assert.deepEqual(Object.keys(response.body.organismes_formateurs[0]), ['id', 'raison_sociale', 'siret', 'numero', 'score']);
    });

    it('can search though all sessions with projection (whitelist)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('organismes', buildOrganismeAccount('11111111111111')),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs?fields=lieux_de_formation');
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.organismes_formateurs.length, 1);
        assert.deepEqual(Object.keys(response.body.organismes_formateurs[0]), ['id', 'lieux_de_formation']);
    });

}));
