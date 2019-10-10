const _ = require('lodash');
const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/with-server');
const { newComment } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur }) => {

    let buildComment = (custom = {}) => {
        return newComment(_.merge({
            codeRegion: '11',
            training: {
                organisation: { siret: '11111111111111' },
                codeFinanceur: ['10'],
            },
        }, custom));
    };

    it('can search avis with qualification', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '10'),
            insertIntoDatabase('comment', buildComment({
                qualification: 'positif',
            })),
            insertIntoDatabase('comment', buildComment({
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
    });

    it('can search avis with siren', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '10'),
            insertIntoDatabase('comment', buildComment({ training: { organisation: { siret: '11111111111111' } } })),
            insertIntoDatabase('comment', buildComment({ training: { organisation: { siret: '11111111122222' } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=111111111')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 2);
    });

    it('can search archived and not archived avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
            insertIntoDatabase('comment', buildComment({ archived: false })),
            insertIntoDatabase('comment', buildComment({ archived: true })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 2);
    });

    it('can search avis by code financeur (PE only)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
            insertIntoDatabase('comment', buildComment({ training: { codeFinanceur: '10' } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?codeFinanceur=10')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
    });

    it('can search avis with all code financeurs (PE)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
            insertIntoDatabase('comment', buildComment({ training: { codeFinanceur: '10' } })),
            insertIntoDatabase('comment', buildComment({ training: { codeFinanceur: '2' } })),
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
            insertIntoDatabase('comment', buildComment({ training: { codeFinanceur: '2' } })),
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
            insertIntoDatabase('comment', buildComment({ training: { codeFinanceur: '10' } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?codeFinanceur=10')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body.details[0].context.key, 'codeFinanceur');
    });

}));
