const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newStagiaire, newAvis } = require('../../../../helpers/data/dataset');
const fixDoublons = require('../../../../../src/jobs/data/migration/tasks/fixDoublons');
const { find } = require('lodash');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('should fixDoublons', async () => {
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
                    action: {
                        session: {
                            id: "213456"
                        },
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
                    identifiant_pe: "123456789"
                },
                formation: {
                    action: {
                        session: {
                            id: "213456"
                        }
                    }
                }
            })),
        ]);

        const updated = await fixDoublons(db);

        assert.strictEqual(updated, 1);
        assert.strictEqual(await db.collection('stagiaires').find({ token: 'toto' }).count(), 1);
        assert.strictEqual((await db.collection('stagiaires').findOne({ token: 'toto' })).doublon, 1);
        assert.strictEqual(await db.collection('stagiaires').find({ token: 'tata' }).count(), 1);
        assert.strictEqual((await db.collection('stagiaires').findOne({ token: 'tata' })).individu.email, 'toto@email.fr');
    });
}));
