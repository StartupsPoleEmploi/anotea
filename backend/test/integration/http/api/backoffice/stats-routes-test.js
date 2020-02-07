const request = require('supertest');
const _ = require('lodash');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');
const { newAvis, newOrganismeAccount, newStagiaire } = require('../../../../helpers/data/dataset');
const computeStats = require('../../../../../src/jobs/stats/tasks/computeStats');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getComponents, getTestDatabase }) => {

    let prepareDatabase = (date = new Date()) => {
        return Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({}, date)),
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({ status: 'rejected' })),
            insertIntoDatabase('avis', newAvis({ status: 'validated', qualification: 'positif' })),
            insertIntoDatabase('avis', newAvis({ status: 'validated', qualification: 'négatif' })),
            insertIntoDatabase('avis', newAvis({ status: 'reported' })),
            insertIntoDatabase('avis', newAvis({
                reponse: {
                    text: 'Voici notre réponse',
                    status: 'none',
                }
            })),
            insertIntoDatabase('accounts', newOrganismeAccount()),
        ]);
    };

    it('can get stats (national)', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let { regions } = await getComponents();
        await prepareDatabase();
        await computeStats(db, regions);

        let response = await request(app)
        .get(`/api/backoffice/stats`);
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(_.omit(response.body.stats[0], ['date']), {
            national: {
                api: {
                    nbAvis: 6,
                    nbAvisRestituables: 0,
                    nbSessions: 0,
                    nbSessionsAvecAvis: 0,
                    nbSessionsCertifiantesAvecAvis: 0,
                    nbAvisParSession: 0,
                },
                organismes: {
                    nbOrganismesContactes: 1,
                    nbMailsEnvoyes: 1,
                    nbOuvertureMails: 0,
                    nbLiensCliques: 0,
                    nbOrganismesActifs: 1,
                },
                avis: {
                    nbStagiairesImportes: 1,
                    nbStagiairesContactes: 1,
                    nbMailEnvoyes: 1,
                    nbCommentairesAModerer: 0,
                    nbMailsOuverts: 1,
                    nbLiensCliques: 0,
                    nbAvisAvecCommentaire: 6,
                    nbCommentairesPositifs: 5,
                    nbCommentairesNegatifs: 1,
                    nbCommentairesRejetes: 1,
                    nbAvis: 6,
                    nbReponses: 1
                },
            },
        });
    });

    it('can get stats (regional)', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let { regions } = await getComponents();
        await prepareDatabase();
        await computeStats(db, regions);

        let response = await request(app)
        .get(`/api/backoffice/stats?codeRegion=11`);
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(_.omit(response.body.stats[0], ['date']), {
            national: {
                api: {
                    nbAvis: 6,
                    nbAvisRestituables: 0,
                    nbSessions: 0,
                    nbSessionsAvecAvis: 0,
                    nbSessionsCertifiantesAvecAvis: 0,
                    nbAvisParSession: 0,
                },
                organismes: {
                    nbOrganismesContactes: 1,
                    nbMailsEnvoyes: 1,
                    nbOuvertureMails: 0,
                    nbLiensCliques: 0,
                    nbOrganismesActifs: 1,
                },
                avis: {
                    nbStagiairesImportes: 1,
                    nbStagiairesContactes: 1,
                    nbMailEnvoyes: 1,
                    nbCommentairesAModerer: 0,
                    nbMailsOuverts: 1,
                    nbLiensCliques: 0,
                    nbAvisAvecCommentaire: 6,
                    nbCommentairesPositifs: 5,
                    nbCommentairesNegatifs: 1,
                    nbCommentairesRejetes: 1,
                    nbAvis: 6,
                    nbReponses: 1
                },
            },
            regional: {
                codeRegion: '11',
                api: {
                    nbAvis: 6,
                    nbAvisRestituables: 0,
                    nbSessions: 0,
                    nbSessionsAvecAvis: 0,
                    nbSessionsCertifiantesAvecAvis: 0,
                    nbAvisParSession: 0,
                },
                organismes: {
                    nbOrganismesContactes: 1,
                    nbMailsEnvoyes: 1,
                    nbOuvertureMails: 0,
                    nbLiensCliques: 0,
                    nbOrganismesActifs: 1,
                },
                avis: {
                    nbStagiairesImportes: 1,
                    nbStagiairesContactes: 1,
                    nbMailEnvoyes: 1,
                    nbCommentairesAModerer: 0,
                    nbMailsOuverts: 1,
                    nbLiensCliques: 0,
                    nbAvisAvecCommentaire: 6,
                    nbCommentairesPositifs: 5,
                    nbCommentairesNegatifs: 1,
                    nbCommentairesRejetes: 1,
                    nbAvis: 6,
                    nbReponses: 1
                },
            },
        });
    });
}));
