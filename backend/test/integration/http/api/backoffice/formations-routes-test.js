const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');
const { newAvis } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur }) => {

    it('can get formations', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@francetravail.fr', '2'),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    numero: 'F_XX_XX',
                    intitule: 'Développeur',
                    action: {
                        organisme_formateur: {
                            siret: '33333333333333',
                        },
                    },
                },
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/formations')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.length, 1);
        assert.deepStrictEqual(response.body[0], {
            numeroFormation: 'F_XX_XX',
            title: 'Développeur',
            nbAvis: 1,
        });
    });

    it('can get formations filtered by organisme (siret)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@francetravail.fr', '2'),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    numero: 'F_XX_XX',
                    intitule: 'Développeur',
                    action: {
                        organisme_formateur: {
                            siret: '33333333333333',
                        },
                    },
                },
            })),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    numero: 'F_XX_11',
                    intitule: 'Développeur',
                    action: {
                        organisme_formateur: {
                            siret: '33333333311111',
                        },
                    },
                },
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/formations?organisme=33333333311111')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.length, 1);
        assert.strictEqual(response.body[0].numeroFormation, 'F_XX_11');
    });

    it('can get formations filtered by organisme (siren)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@francetravail.fr', '2'),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    numero: 'F_XX_XX',
                    intitule: 'Développeur',
                    action: {
                        organisme_formateur: {
                            siret: '33333333333333',
                        },
                    },
                },
            })),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    numero: 'F_XX_11',
                    intitule: 'Développeur',
                    action: {
                        organisme_formateur: {
                            siret: '33333333333333',
                        },
                    },
                },
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/formations?organisme=333333333')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.length, 2);
    });


    it('can get formations from other region', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@francetravail.fr', '2'),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    numero: 'F_XX_XX',
                    intitule: 'Développeur',
                    action: {
                        organisme_formateur: {
                            siret: '33333333333333',
                        },
                    },
                },
            })),
            insertIntoDatabase('avis', newAvis({
                formation: {
                    numero: 'F_XX_11',
                    intitule: 'Développeur',
                    action: {
                        organisme_formateur: {
                            siret: '33333333311111',
                        },
                    },
                },
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/formations?organisme=33333333311111')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.length, 1);
        assert.strictEqual(response.body[0].numeroFormation, 'F_XX_11');
    });


}));
