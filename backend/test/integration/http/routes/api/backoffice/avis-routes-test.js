const _ = require('lodash');
const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/with-server');
const { newAvis } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur, logAsFinanceur, logAsOrganisme }) => {

    let buildAvis = (custom = {}) => {
        return newAvis(_.merge({
            codeRegion: '11',
            training: {
                organisation: { siret: '11111111111111' },
                codeFinanceur: ['10'],
            },
        }, custom));
    };

    let profiles = (values, testCallback) => {
        let testParameters = [
            {
                profileName: 'moderateur',
                logUser: app => logAsModerateur(app, 'admin@pole-emploi.fr', { codeRegion: '11' }),
            },
            {
                profileName: 'financeur',
                logUser: app => logAsFinanceur(app, 'financeur@pole-emploi.fr', '10', { codeRegion: '11' }),
            },
            {
                profileName: 'organisme',
                logUser: app => logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111', { codeRegion: '11' }),
            }
        ];

        return testParameters.filter(p => values.includes(p.profileName)).forEach(testCallback);
    };

    it('can not search avis when not authenticated', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/backoffice/avis');
        assert.strictEqual(response.statusCode, 401);
        assert.deepStrictEqual(response.body, { error: true });
    });

    profiles(['moderateur', 'financeur', 'organisme'], ({ profileName, logUser }) => {

        it(`[${profileName}] can search avis`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', buildAvis()),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.deepStrictEqual(response.body.meta, {
                pagination: {
                    page: 0,
                    itemsPerPage: 2,
                    itemsOnThisPage: 1,
                    totalItems: 1,
                    totalPages: 1
                }
            });
        });

        it(`[${profileName}] can search avis with pagination`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logAsModerateur(app, 'admin@pole-emploi.fr'),
                insertIntoDatabase('avis', buildAvis()),
                insertIntoDatabase('avis', buildAvis()),
                insertIntoDatabase('avis', buildAvis()),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis?page=0')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.deepStrictEqual(response.body.avis.length, 2);
            assert.deepStrictEqual(response.body.meta.pagination, {
                page: 0,
                itemsPerPage: 2,
                itemsOnThisPage: 2,
                totalItems: 3,
                totalPages: 2
            });

            response = await request(app)
            .get('/api/backoffice/avis?page=1')
            .set('authorization', `Bearer ${token}`);

            assert.deepStrictEqual(response.body.meta.pagination, {
                page: 1,
                itemsPerPage: 2,
                itemsOnThisPage: 1,
                totalItems: 3,
                totalPages: 2
            });
        });
    });

    profiles(['moderateur', 'financeur'], ({ profileName, logUser }) => {

        it(`[${profileName}] can search avis with commentaires`, async () => {

            let app = await startServer();
            let avis = buildAvis({ token: 'sans-commentaire' });
            delete avis.commentaire;

            let [token] = await Promise.all([
                logAsModerateur(app, 'admin@pole-emploi.fr'),
                insertIntoDatabase('avis', buildAvis({ token: 'avec-commentaire' })),
                insertIntoDatabase('avis', avis),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis?commentaires=true')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].token, 'avec-commentaire');

            response = await request(app)
            .get('/api/backoffice/avis?commentaires=false')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].token, 'sans-commentaire');
        });

        it(`[${profileName}] should not return avis from other region`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', buildAvis({ codeRegion: '6' })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 0);
        });
    });

    profiles(['financeur', 'organisme'], ({ profileName, logUser }) => {
        it(`[${profileName}] should not return avis à moderer`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', buildAvis({ status: 'validated' })),
                insertIntoDatabase('avis', buildAvis({ status: 'none' })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.ok(response.body.avis[0].status, 'validated');
        });
    });

    profiles(['moderateur', 'organisme'], ({ profileName, logUser }) => {
        it(`[${profileName}] should not return archived avis`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', buildAvis({ status: 'validated' })),
                insertIntoDatabase('avis', buildAvis({ status: 'archived' })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].status, 'validated');
        });

        it(`[${profileName}] can search avis with reponse`, async () => {
            let app = await startServer();
            let [token] = await Promise.all([
                logAsModerateur(app, 'admin@pole-emploi.fr'),
                insertIntoDatabase('avis', buildAvis({
                    reponse: {
                        text: 'Voici notre réponse',
                        status: 'validated',
                    },
                })),
                insertIntoDatabase('avis', buildAvis({
                    reponse: {
                        text: 'Voici notre réponse',
                        status: 'rejected',
                    },
                })),
                insertIntoDatabase('avis', buildAvis({
                    reponse: {
                        text: 'Voici notre réponse',
                        status: 'none',
                    },
                })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis?reponseStatuses=validated')
            .set('authorization', `Bearer ${token}`);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].reponse.status, 'validated');

            response = await request(app)
            .get('/api/backoffice/avis?reponseStatuses=rejected')
            .set('authorization', `Bearer ${token}`);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].reponse.status, 'rejected');

            response = await request(app)
            .get('/api/backoffice/avis?reponseStatuses=none')
            .set('authorization', `Bearer ${token}`);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].reponse.status, 'none');
        });
    });

}));
