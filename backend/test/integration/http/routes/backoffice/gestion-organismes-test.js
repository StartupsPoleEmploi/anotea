const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const { newOrganismeAccount } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getTestDatabase, logAsModerateur }) => {

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
        .post(`/api/backoffice/organisation/${id}/editedCourriel`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'edited@pole-emploi.fr' });

        assert.equal(response.statusCode, 201);
        assert.deepEqual(response.body, { 'status': 'OK' });

        let db = await getTestDatabase();
        let res = await db.collection('accounts').findOne({ _id: id });
        assert.deepEqual(res.editedCourriel, 'edited@pole-emploi.fr');
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
        .delete(`/api/backoffice/organisation/${id}/editedCourriel`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, { 'status': 'OK' });

        let db = await getTestDatabase();
        let res = await db.collection('accounts').findOne({ _id: id });
        assert.ok(!res.editedCourriel);
    });
}));
