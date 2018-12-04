const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../helpers/test-db');
const { newTrainee } = require('../../helpers/data/dataset');
const doImportRome = require('../../../jobs/import/rome/importer');
const doImportINSEE = require('../../../jobs/import/insee/importer');
const logger = require('../../helpers/test-logger');
const externalLinks = require('../../../components/externalLinks');

describe(__filename, withMongoDB(({ getTestDatabase }) => {

    it('should get La Bonne Boite link with a training having a postal code without INSEE mapping', async () => {
        let db = await getTestDatabase();
        const trainee = newTrainee({
            training: {
                formacode: '21032',
                place: { postalCode: '44300' }
            }
        });
        let importerRome = doImportRome(db, logger);
        await importerRome.doImport(path.join(__dirname, '../../helpers/data', 'romeMapping.csv'));

        let importerINSEE = doImportINSEE(db, logger);
        await importerINSEE.doImport(path.join(__dirname, '../../../data', 'correspondances-code-insee-code-postal.csv'));

        assert.equal(await externalLinks(db).getLink(trainee, 'lbb'), 'https://labonneboite.pole-emploi.fr/entreprises/commune/44300/rome/A1101?d=30');
    });

    it('should get La Bonne Boite link with a training having a postal code with an INSEE mapping', async () => {
        let db = await getTestDatabase();
        const trainee = newTrainee({
            training: {
                formacode: '21032',
                place: { postalCode: '75011' }
            }
        });
        let importerRome = doImportRome(db, logger);
        await importerRome.doImport(path.join(__dirname, '../../helpers/data', 'romeMapping.csv'));

        let importerINSEE = doImportINSEE(db, logger);
        await importerINSEE.doImport(path.join(__dirname, '../../../data', 'correspondances-code-insee-code-postal.csv'));

        assert.equal(await externalLinks(db).getLink(trainee, 'lbb'), 'https://labonneboite.pole-emploi.fr/entreprises/commune/75111/rome/A1101?d=30');
    });

    it('should get Offres Pôle Emploi link with a training having a postal code without INSEE mapping', async () => {
        let db = await getTestDatabase();
        const trainee = newTrainee({
            training: {
                formacode: '21032',
                place: { postalCode: '44300' }
            }
        });
        let importerRome = doImportRome(db, logger);
        await importerRome.doImport(path.join(__dirname, '../../helpers/data', 'romeMapping.csv'));

        let importerINSEE = doImportINSEE(db, logger);
        await importerINSEE.doImport(path.join(__dirname, '../../../data', 'correspondances-code-insee-code-postal.csv'));

        assert.equal(await externalLinks(db).getLink(trainee, 'pe'), 'https://candidat.pole-emploi.fr/offres/recherche?lieux=44300&motsCles=A1101&offresPartenaires=true&rayon=30&tri=0');
    });

    it('should get Offres Pôle Emploi link with a training having a postal code with an INSEE mapping', async () => {
        let db = await getTestDatabase();
        const trainee = newTrainee({
            training: {
                formacode: '21032',
                place: { postalCode: '75011' }
            }
        });
        let importerRome = doImportRome(db, logger);
        await importerRome.doImport(path.join(__dirname, '../../helpers/data', 'romeMapping.csv'));

        let importerINSEE = doImportINSEE(db, logger);
        await importerINSEE.doImport(path.join(__dirname, '../../../data', 'correspondances-code-insee-code-postal.csv'));

        assert.equal(await externalLinks(db).getLink(trainee, 'pe'), 'https://candidat.pole-emploi.fr/offres/recherche?lieux=75111&motsCles=A1101&offresPartenaires=true&rayon=30&tri=0');
    });

    it('should get Clara link', async () => {
        let db = await getTestDatabase();
        const trainee = newTrainee({
            training: {
                formacode: '21032',
                place: { postalCode: '75011' }
            }
        });

        assert.equal(await externalLinks(db).getLink(trainee, 'clara'), 'https://clara.pole-emploi.fr');
    });

}));
