const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const { newFinancerAccount } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinancer, logAsOrganisme }) => {

    it('can retrieve advices when authenticated as financer', async () => {

        let app = await startServer();

        let codeRegion = 11;

        await insertIntoDatabase('financer', newFinancerAccount({
            codeRegion
        }));

        let token = await logAsFinancer(app, 'financer@pole-emploi.fr', '2');

        let response = await request(app).get(`/api/backoffice/financeur/region/${codeRegion}/advices`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            'advices': [],
            'page': 1,
            'pageCount': 0
        });
    });

    it('can retrieve advices when authenticated as Pole Emploi financer for another code financer', async () => {

        let app = await startServer();

        let codeRegion = 11;
        let codeFinanceur = '5';

        await insertIntoDatabase('financer', newFinancerAccount({
            codeRegion,
            codeFinanceur
        }));

        let token = await logAsFinancer(app, 'financer@pole-emploi.fr', '4');

        let response = await request(app).get(`/api/backoffice/financeur/region/${codeRegion}/advices?codeFinanceur=${codeFinanceur}`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            'advices': [],
            'page': 1,
            'pageCount': 0
        });
    });

    it('can not retrieve advices when authenticated as financer for another region', async () => {

        let app = await startServer();

        let codeRegion = 17;

        await insertIntoDatabase('financer', newFinancerAccount({
            codeRegion
        }));

        let token = await logAsFinancer(app, 'financer@pole-emploi.fr', '2');

        let response = await request(app).get(`/api/backoffice/financeur/region/${codeRegion}/advices`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 403);
        assert.deepEqual(response.body, {
            'error': 'Forbidden',
            'message': 'Action non autorisé',
            'statusCode': 403
        });
    });

    it('can not retrieve advices when authenticated as financer for another code financer', async () => {

        let app = await startServer();

        let codeRegion = 11;
        let codeFinanceur = '5';

        await insertIntoDatabase('financer', newFinancerAccount({
            codeRegion,
            codeFinanceur
        }));

        let token = await logAsFinancer(app, 'financer@pole-emploi.fr', '8');

        let response = await request(app).get(`/api/backoffice/financeur/region/${codeRegion}/advices?codeFinanceur=${codeFinanceur}`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 403);
        assert.deepEqual(response.body, {
            'error': 'Forbidden',
            'message': 'Action non autorisé',
            'statusCode': 403
        });
    });

    it('can not retrieve advices when authenticated as Pole Emploi financer for another code region', async () => {

        let app = await startServer();

        let codeRegion = 17;
        let codeFinanceur = '5';

        await insertIntoDatabase('financer', newFinancerAccount({
            codeRegion,
            codeFinanceur
        }));

        let token = await logAsFinancer(app, 'financer@pole-emploi.fr', '4');

        let response = await request(app).get(`/api/backoffice/financeur/region/${codeRegion}/advices?codeFinanceur=${codeFinanceur}`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 403);
        assert.deepEqual(response.body, {
            'error': 'Forbidden',
            'message': 'Action non autorisé',
            'statusCode': 403
        });
    });

    it('can not retrieve advices when authenticated as organisme', async () => {

        let app = await startServer();

        let codeRegion = 11;

        await insertIntoDatabase('financer', newFinancerAccount({
            codeRegion
        }));

        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr');

        let response = await request(app).get(`/api/backoffice/financeur/region/${codeRegion}/advices`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, { error: true });
    });

}));
