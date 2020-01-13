const assert = require('assert');

const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newOrganismeAccount } = require('../../../../helpers/data/dataset');
const removeCourriels = require('../../../../../src/jobs/data/migration/tasks/removeCourriels');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('should remove courriels (intercarif)', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            await insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111111,
                SIRET: 11111111111111,
                courriel: 'contact@poleemploi-formation.fr',
                courriels: ['contact@poleemploi-formation.fr'],
                meta: {
                    siretAsString: '11111111111111'
                },
            })),
        ]);


        let stats = await removeCourriels(db);

        assert.deepStrictEqual(stats, { updated: 1 });
        let updated = await db.collection('accounts').findOne({ _id: 11111111111111 });
        assert.strictEqual(updated.courriel, 'contact@poleemploi-formation.fr');
        assert.deepStrictEqual(updated.courriels, [
            { courriel: 'contact@poleemploi-formation.fr', source: 'intercarif' },
        ]);
    });

    it('should remove courriels (kairos)', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            await insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111111,
                SIRET: 11111111111111,
                courriel: 'contact@poleemploi-formation.fr',
                courriels: ['contact@poleemploi-formation.fr'],
                kairosCourriel: 'kairos@pole-emploi.fr',
                meta: {
                    siretAsString: '11111111111111'
                },
            })),
        ]);


        let stats = await removeCourriels(db);

        assert.deepStrictEqual(stats, {
            updated: 1,
        });
        let updated = await db.collection('accounts').findOne({ _id: 11111111111111 });
        assert.strictEqual(updated.courriel, 'kairos@pole-emploi.fr');
        assert.deepStrictEqual(updated.courriels, [
            { courriel: 'contact@poleemploi-formation.fr', source: 'intercarif' },
            { courriel: 'kairos@pole-emploi.fr', source: 'kairos' },
        ]);
    });

    it('should remove courriels (edited)', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            await insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111111,
                SIRET: 11111111111111,
                courriel: 'contact@poleemploi-formation.fr',
                courriels: ['contact@poleemploi-formation.fr'],
                editedCourriel: 'edited@pole-emploi.fr',
                kairosCourriel: 'kairos@pole-emploi.fr',
                meta: {
                    siretAsString: '11111111111111'
                },
            })),
        ]);


        let stats = await removeCourriels(db);

        assert.deepStrictEqual(stats, {
            updated: 1,
        });
        let updated = await db.collection('accounts').findOne({ _id: 11111111111111 });
        assert.strictEqual(updated.courriel, 'edited@pole-emploi.fr');
        assert.deepStrictEqual(updated.courriels, [
            { courriel: 'contact@poleemploi-formation.fr', source: 'intercarif' },
            { courriel: 'edited@pole-emploi.fr', source: 'anotea' },
            { courriel: 'kairos@pole-emploi.fr', source: 'kairos' },
        ]);
    });
}));
