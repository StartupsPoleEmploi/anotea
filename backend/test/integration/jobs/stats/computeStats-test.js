const assert = require('assert');
const { withMongoDB } = require('../../../helpers/with-mongodb');
const { newStagiaire, newAvis, newOrganismeAccount } = require('../../../helpers/data/dataset');
const computeStats = require('../../../../src/jobs/stats/tasks/computeStats');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase, getComponents }) => {

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

    it('should compute stats (national)', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let date = new Date();
        await prepareDatabase(date);

        await computeStats(db, regions);

        assert.strictEqual(await db.collection('statistics').count(), 1);
        let doc = await db.collection('statistics').findOne();
        assert.deepStrictEqual(doc.national, {
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
            campagnes: [
                {
                    campaign: 'test-campaign',
                    date,
                    nbStagiairesContactes: 1,
                    nbMailsOuverts: 1,
                    nbLiensCliques: 0,
                    nbAvis: 6,
                    nbCommentaires: 6,
                }
            ]
        });
    });

    it('should compute stats (regional)', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let date = new Date();
        await prepareDatabase(date);

        await computeStats(db, regions);

        assert.strictEqual(await db.collection('statistics').count(), 1);
        let doc = await db.collection('statistics').findOne();
        assert.deepStrictEqual(doc.regions['11'], {
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
        });
    });
}));
