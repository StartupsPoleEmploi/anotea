const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newOrganismeAccount } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur, logAsOrganisme }) => {

    it('can retrieve avis when authenticated as organisme', async () => {

        let app = await startServer();

        let id = 22222222222222;

        let token = await logAsOrganisme(app, 'edited@pole-emploi.fr', id);

        let response = await request(app).get(`/api/backoffice/organisme/${id}/allAdvices`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            'advices': [],
            'page': 1,
            'pageCount': 0
        });
    });

    it('can not retrieve avis when authenticated as financeur', async () => {

        let app = await startServer();

        let id = 33333333333333;

        await insertIntoDatabase('accounts', newOrganismeAccount({
            _id: id,
            SIRET: id,
            editedCourriel: 'edited@pole-emploi.fr',
            meta: {
                siretAsString: `${id}`
            },
        }));

        let token = await logAsFinanceur(app, 'financeur@pole-emploi.fr', '2');

        let response = await request(app).get(`/api/backoffice/organisme/${id}/allAdvices`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 403);
        assert.deepStrictEqual(response.body, {
            'error': 'Forbidden',
            'message': 'Action non autorisé',
            'statusCode': 403
        });
    });

    it('can not retrieve avis from an organisme when authenticated as another organisme', async () => {

        let app = await startServer();

        let id = 44444444444444;
        let courriel = 'edited@pole-emploi.fr';

        await insertIntoDatabase('accounts', newOrganismeAccount({
            _id: id,
            SIRET: id,
            courriel,
            meta: {
                siretAsString: `${id}`
            }
        }));

        let token = await logAsOrganisme(app, courriel, 55555555555555);

        let response = await request(app).get(`/api/backoffice/organisme/${id}/allAdvices`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 403);
        assert.deepStrictEqual(response.body, {
            'error': 'Forbidden',
            'message': 'Action non autorisé',
            'statusCode': 403
        });
    });

}));
