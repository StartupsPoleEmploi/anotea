const request = require('supertest');
const _ = require('lodash');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');

describe(__filename, withServer(({ startServer, getTestDatabase }) => {

    it('can post a question', async () => {

        let app = await startServer();
        let question = { question: 'Est ce que c\'était bien ?', contact: 'john@pe.fr', referrer: 'http://source?page=1' };

        let response = await request(app)
        .post('/api/contact-stagiaires')
        .send(question);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(_.omit(response.body, ['_id']), question);

        let db = await getTestDatabase();
        let doc = await db.collection('contactStagiaires').findOne();
        assert.deepStrictEqual(_.omit(doc, ['_id']), question);
    });

    it('should prevent xss attack', async () => {

        let app = await startServer();
        let question = { question: '<script>alert("xss");</script>', contact: 'h@ck.er' };

        let response = await request(app)
        .post('/api/contact-stagiaires')
        .send(question);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.question, '&lt;script&gt;alert("xss");&lt;/script&gt;');

        let db = await getTestDatabase();
        let doc = await db.collection('contactStagiaires').findOne();
        assert.deepStrictEqual(doc.question, '&lt;script&gt;alert("xss");&lt;/script&gt;');
    });
}));
