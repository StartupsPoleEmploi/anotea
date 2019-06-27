const request = require('supertest');
const _ = require('lodash');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');

describe(__filename, withServer(({ startServer, getTestDatabase }) => {

    it('can post a question', async () => {

        let app = await startServer();
        let question = { question: 'Est ce que c\'était bien ?', contact: 'john@pe.fr', referrer: 'http://source?page=1' };

        let response = await request(app)
        .post('/api/contactStagiaires')
        .send(question);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.date);
        assert.deepStrictEqual(_.omit(response.body, ['_id', 'date']), question);

        let db = await getTestDatabase();
        let doc = await db.collection('contactStagiaires').findOne();
        assert.ok(doc.date);
        assert.deepStrictEqual(_.omit(doc, ['_id', 'date']), question);
    });

    it('should prevent xss attack', async () => {

        let app = await startServer();
        let question = { question: '<script>alert("xss");</script>', contact: 'h@ck.er' };

        let response = await request(app)
        .post('/api/contactStagiaires')
        .send(question);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.question, '&lt;script&gt;alert("xss");&lt;/script&gt;');

        let db = await getTestDatabase();
        let doc = await db.collection('contactStagiaires').findOne();
        assert.deepStrictEqual(doc.question, '&lt;script&gt;alert("xss");&lt;/script&gt;');
    });

    it('should reject invalid post', async () => {

        let app = await startServer();
        let question = { question: _.range(501).map(() => 'a'), contact: 'h@ck.er' };

        let response = await request(app)
        .post('/api/contactStagiaires')
        .send(question);

        assert.strictEqual(response.statusCode, 400);

        let db = await getTestDatabase();
        let count = await db.collection('contactStagiaires').countDocuments();
        assert.strictEqual(count, 0);
    });
}));
