const assert = require('assert');
const { withMongoDB } = require('../../../helpers/with-mongodb');
const logger = require('../../../helpers/components/fake-logger');
const importStagiaires = require('../../../../src/jobs/import/stagiaires/tasks/importStagiaires');
const poleEmploiCSVHandler = require('../../../../src/jobs/import/stagiaires/tasks/handlers/poleEmploiCSVHandler');
const removeOldStagiaires = require('../../../../src/jobs/clean/tasks/removeOldStagiaires');

const moment = require('moment');

describe.only(__filename, withMongoDB(({ getTestDatabase, getComponents, getTestFile, insertIntoDatabase }) => {

    it('should remove stagiaire contacted at unknown date', async () => {
        let db = await getTestDatabase();
        await insertIntoDatabase('stagiaires', { mailSent: true, individu: { nom: "TOTO" } });
        await insertIntoDatabase('stagiaires', { mailSent: true });

        const stats = await removeOldStagiaires(db, logger);
        assert.strictEqual(1, stats.deletedMailSentNoDate);
        assert.strictEqual(0, stats.deletedMailSentTooOld);
        assert.strictEqual(0, stats.deletedMailNotSent);
    });

    it('should remove stagiaire contacted too long ago', async () => {
        let db = await getTestDatabase();
        await insertIntoDatabase('stagiaires', { mailSent: true, mailSentDate: moment().subtract(11, 'months').toDate(), individu: { nom: "TATA" } });
        await insertIntoDatabase('stagiaires', { mailSent: true, mailSentDate: moment().subtract(2, 'years').toDate(), individu: { nom: "TOTO" } });
        await insertIntoDatabase('stagiaires', { mailSent: true, mailSentDate: moment().subtract(2, 'years').toDate() });

        const stats = await removeOldStagiaires(db, logger);
        assert.strictEqual(0, stats.deletedMailSentNoDate);
        assert.strictEqual(1, stats.deletedMailSentTooOld);
        assert.strictEqual(0, stats.deletedMailNotSent);
    });

    it('should remove stagiaire not contacted', async () => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();

        const statsImportStagiaire = await importStagiaires(db, logger, getTestFile('stagiaires-pe.csv'), poleEmploiCSVHandler(db, regions));
        await insertIntoDatabase('stagiaires', { mailSent: false });

        const stats = await removeOldStagiaires(db, logger);
        assert.strictEqual(0, stats.deletedMailSentNoDate);
        assert.strictEqual(0, stats.deletedMailSentTooOld);
        assert.strictEqual(5, statsImportStagiaire.imported);
        assert.strictEqual(5, stats.deletedMailNotSent);
    });

}));
