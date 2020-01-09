const assert = require('assert');

const { withMongoDB } = require('../../../../helpers/with-mongodb');
const logger = require('../../../../helpers/components/fake-logger');
const { newOrganismeAccount } = require('../../../../helpers/data/dataset');
const updateOrganismeKairosCourriels = require('../../../../../src/jobs/data/emails/tasks/updateOrganismeKairosCourriels');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    let createCSVStream = (lines = []) => {

        const Readable = require('stream').Readable;
        const readable = new Readable();
        readable._read = () => {
        };
        lines.forEach(line => readable.push(line));
        readable.push(null);
        return readable;
    };

    it('should upate emails', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            await insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111111,
                SIRET: 11111111111111,
                kairosCourriel: 'kairos@pole-emploi.fr',
                meta: {
                    siretAsString: '11111111111111'
                },
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 22222222222222,
                SIRET: 22222222222222,
                kairosCourriel: 'other@pole-emploi.fr',
                meta: {
                    siretAsString: '22222222222222'
                },
            })),
        ]);

        let stream = createCSVStream([
            'Siret|Nom|Email Anotea|Nombre Avis|Email Kairos\n',
            '11111111111111|Anotéa formation|before@pole-emploi.fr|744|after@pole-emploi.fr\n'
        ]);

        let stats = await updateOrganismeKairosCourriels(db, logger, stream);

        assert.deepStrictEqual(stats, {
            total: 1,
            updated: 1,
            invalid: 0,
            unknown: 0,
        });
        let updated = await db.collection('accounts').findOne({ _id: 11111111111111 });
        assert.strictEqual(updated.kairosCourriel, 'after@pole-emploi.fr');
        assert.deepStrictEqual(updated.courriels, [
            'before@pole-emploi.fr',
            'after@pole-emploi.fr',
        ]);
    });
}));
