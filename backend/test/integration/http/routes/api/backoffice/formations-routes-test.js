const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newComment } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur }) => {

    it('can get formations', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({
                training: {
                    idFormation: 'F_XX_XX',
                    title: 'Développeur',
                    organisation: {
                        siret: `${33333333333333}`,
                    },
                }
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/formations')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.length, 1);
        assert.deepStrictEqual(response.body[0], {
            idFormation: 'F_XX_XX',
            title: 'Développeur',
            nbAvis: 1,
        });
    });

    it('can get formations filtered by siret', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({
                training: {
                    idFormation: 'F_XX_XX',
                    title: 'Développeur',
                    organisation: {
                        siret: `${33333333333333}`,
                    },
                }
            })),
            insertIntoDatabase('comment', newComment({
                training: {
                    idFormation: 'F_XX_11',
                    title: 'Développeur',
                    organisation: {
                        siret: `${33333333311111}`,
                    },
                }
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/formations?siret=33333333311111')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.length, 1);
        assert.strictEqual(response.body[0].idFormation, 'F_XX_11');
    });

    it('can get formations from other region', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({
                training: {
                    idFormation: 'F_XX_XX',
                    title: 'Développeur',
                    organisation: {
                        siret: `${33333333333333}`,
                    },
                }
            })),
            insertIntoDatabase('comment', newComment({
                training: {
                    idFormation: 'F_XX_11',
                    title: 'Développeur',
                    organisation: {
                        siret: `${33333333311111}`,
                    },
                }
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/formations?siret=33333333311111')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.length, 1);
        assert.strictEqual(response.body[0].idFormation, 'F_XX_11');
    });


}));
