const _ = require('lodash');
const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');
const { newAvis } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur }) => {

    let buildAvis = (custom = {}) => {
        return newAvis(_.merge({
            codeRegion: '11',
            formation: {
                action: {
                    organisme_financeurs: [{
                        code_financeur: '10',
                    }],
                    organisme_formateur: {
                        siret: '11111111111111',
                    },
                },
            },
        }, custom));
    };

    it(`can search avis with status (+default)`, async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '10'),
            insertIntoDatabase('avis', buildAvis({ status: 'validated' })),
            insertIntoDatabase('avis', buildAvis({ status: 'rejected' })),
            insertIntoDatabase('avis', buildAvis({ status: 'reported' })),
            insertIntoDatabase('avis', buildAvis({ status: 'none' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => ['validated', 'rejected', 'reported'].includes(a.status)).length, 2);

        response = await request(app)
        .get('/api/backoffice/avis?statuses=validated')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'validated');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=rejected')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'rejected');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=reported')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'reported');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=none')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 400);
    });

    it('can search avis with qualification', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '10'),
            insertIntoDatabase('avis', buildAvis({
                qualification: 'positif',
            })),
            insertIntoDatabase('avis', buildAvis({
                qualification: 'négatif',
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?qualification=positif')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].qualification, 'positif');

        response = await request(app)
        .get('/api/backoffice/avis?qualification=négatif')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].qualification, 'négatif');

        response = await request(app)
        .get('/api/backoffice/avis?qualification=INVALID')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 400);
    });

    it('can search avis with siren', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '10'),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '11111111111111' } } } })),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '11111111122222' } } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=111111111')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 2);

        response = await request(app)
        .get('/api/backoffice/avis?siren=000000000')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
    });

    it('can search avis by code financeur (PE only)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_financeurs: [{ code_financeur: '10' }] } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?codeFinanceur=10')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
    });

    it('can search avis by dispositif financement', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
            insertIntoDatabase('avis', buildAvis({ dispositifFinancement: 'AIF' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?dispositifFinancement=AIF')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
    });

    it('should automatically filter by all code financeurs (PE)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_financeurs: [{ code_financeur: '10' }] } } })),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_financeurs: [{ code_financeur: '2' }] } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 2);
    });

    it('should automatically filter by codeFinanceur (conseil regional)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '10'),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_financeurs: [{ code_financeur: '2' }] } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
    });

    it('can not search avis by code financeur (conseil regional)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '10'),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_financeurs: [{ code_financeur: '10' }] } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?codeFinanceur=10')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body.details[0].context.key, 'codeFinanceur');
    });

    it('should return archived', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
            insertIntoDatabase('avis', buildAvis({ status: 'validated' })),
            insertIntoDatabase('avis', buildAvis({ status: 'archived' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 2);
    });

    it('returns avis without the commentReport field for financeur', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '10'),
            insertIntoDatabase('avis', buildAvis()),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].commentReport, undefined );
    });

}));
