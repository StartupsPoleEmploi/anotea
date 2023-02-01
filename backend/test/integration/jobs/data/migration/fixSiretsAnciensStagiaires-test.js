const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newStagiaire, newAvis } = require('../../../../helpers/data/dataset');
const fixDoublons = require('../../../../../src/jobs/data/migration/tasks/fixDoublons');
const fixSiretsAnciensStagiaires = require('../../../../../src/jobs/data/migration/tasks/fixSiretsAnciensStagiaires');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('should fixSiretsAnciensStagiaires', async () => {
        let db = await getTestDatabase();
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                token: "toto",
                refreshKey: "toto",
                individu: {
                    email: 'toto@email.fr',
                    identifiant_pe: "123456789"
                },
                formation: {
                    numero: "numero_formation",
                    action: {
                        numero: "numero_action",
                        organisme_responsable: {
                            siret: "12345678901234"
                        }
                    }
                }
            })),
            insertIntoDatabase('stagiaires', newStagiaire({
                token: "tata",
                refreshKey: "tata",
                individu: {
                    email: 'tata@email.fr',
                    identifiant_pe: "423456789"
                },
                formation: {
                    numero: "numero_formation",
                    action: {
                        numero: "numero_action",
                    }
                }
            })),
        ]);

        const updatedFixDoublons = await fixDoublons(db);
        const updatedFixSiretsAnciensStagiaires = await fixSiretsAnciensStagiaires(db);

        assert.strictEqual(updatedFixDoublons, 0);
        assert.strictEqual(updatedFixSiretsAnciensStagiaires, 1);
        assert.strictEqual(await db.collection('stagiaires').find({ token: 'toto' }).count(), 1);
        assert.strictEqual((await db.collection('stagiaires').findOne({ token: 'toto' })).doublon, undefined);
        assert.strictEqual(await db.collection('stagiaires').find({ token: 'tata' }).count(), 1);
        assert.strictEqual((await db.collection('stagiaires').findOne({ token: 'tata' })).individu.email, 'tata@email.fr');
        assert.deepStrictEqual((await db.collection('stagiaires').findOne({ token: 'tata' })).formation.action.organisme_responsable, { siret: "12345678901234" });
    });
}));
