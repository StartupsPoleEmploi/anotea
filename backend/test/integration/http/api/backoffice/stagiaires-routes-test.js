const request = require('supertest');
const _ = require('lodash');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');
const { newStagiaire } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur, logAsFinanceur, logAsOrganisme }) => {

    let buildStagiaire = (custom = {}) => {
        return newStagiaire(_.merge({
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

    let profiles = (values, testCallback) => {
        let testParameters = [
            {
                profileName: 'moderateur',
                logUser: app => logAsModerateur(app, 'admin@francetravail.fr', { codeRegion: '11' }),
            },
            {
                profileName: 'financeur',
                logUser: app => logAsFinanceur(app, 'financeur@francetravail.fr', '10', { codeRegion: '11' }),
            },
            {
                profileName: 'organisme',
                logUser: app => logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111', { codeRegion: '11' }),
            }
        ];

        return testParameters.filter(p => values.includes(p.profileName)).forEach(testCallback);
    };

    profiles(['moderateur', 'financeur', 'organisme'], ({ profileName, logUser }) => {

        it(`[${profileName}] can compute stagiaires stats`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('stagiaires', buildStagiaire({
                    mailSent: true,
                    mailSentDate: new Date()
                })),
                insertIntoDatabase('stagiaires', buildStagiaire({
                    mailSent: null,
                    mailSentDate: new Date()
                })),
                insertIntoDatabase('stagiaires', buildStagiaire({
                    mailSent: false,
                    mailSentDate: null
                })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/stagiaires/stats')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.deepStrictEqual(response.body, {
                total: 3,
                nbEmailsEnvoyes: 2,
            });
        });
    });

}));
