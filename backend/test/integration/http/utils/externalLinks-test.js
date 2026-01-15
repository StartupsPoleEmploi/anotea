const assert = require('assert');
const { withMongoDB } = require('../../../helpers/with-mongodb');
const { newStagiaire } = require('../../../helpers/data/dataset');
const importCommunes = require('../../../../src/jobs/import/communes/tasks/importCommunes');
const logger = require('../../../helpers/components/fake-logger');
const externalLinks = require('../../../../src/http/utils/externalLinks');

describe(__filename, withMongoDB(({ getTestDatabase, getTestFile, getComponents }) => {

    let romeMappgingFile = getTestFile('romeMapping.csv');
    let communesCsvFile = getTestFile('communes.csv');
    let cedexCsvFile = getTestFile('cedex.csv');

    it('should get La Bonne Boite link with a formation having a postal code without INSEE mapping', async () => {
        let db = await getTestDatabase();
        db.collection('formacodeRomeMapping').insertOne({
            codeROME: "A1101", label: "Conduite d'engins agricoles et forestiers",
            formacodes: [
                {formacode: "21032", label: "AGROEQUIPEMENT"},
                {formacode: "21043",label: "BUCHERONNAGE"},
                {formacode: "21042",label: "EXPLOITATION FORESTIERE"},
                {formacode: "21011",label: "MACHINISME AGRICOLE"},
                {formacode: "21044",label: "MACHINISME FORESTIER"},
                {formacode: "21034",label: "MACHINISME HORTICOLE"},
                {formacode: "21055",label: "MACHINISME VITICOLE"},
            ]
        });

        let { communes } = await getComponents();
        const stagiaire = newStagiaire({
            formation: {
                domaine_formation: {
                    formacodes: ['21032'],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '84170',
                    },
                },
            },
        });

        await importCommunes(db, logger, communesCsvFile, cedexCsvFile);

        let links = await externalLinks(db, communes).getLink(stagiaire, 'lbb');
        assert.strictEqual(links, 'https://labonneboite.francetravail.fr/entreprises/commune/84080/rome/A1101?d=30');
    });

    it('should get La Bonne Boite link with a formation having a postal code with an INSEE mapping', async () => {
        let db = await getTestDatabase();
        db.collection('formacodeRomeMapping').insertOne({
            codeROME: "A1101", label: "Conduite d'engins agricoles et forestiers",
            formacodes: [
                {formacode: "21032", label: "AGROEQUIPEMENT"},
                {formacode: "21043",label: "BUCHERONNAGE"},
                {formacode: "21042",label: "EXPLOITATION FORESTIERE"},
                {formacode: "21011",label: "MACHINISME AGRICOLE"},
                {formacode: "21044",label: "MACHINISME FORESTIER"},
                {formacode: "21034",label: "MACHINISME HORTICOLE"},
                {formacode: "21055",label: "MACHINISME VITICOLE"},
            ]
        });
        let { communes } = await getComponents();
        const stagiaire = newStagiaire({
            formation: {
                domaine_formation: {
                    formacodes: ['21032'],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '84170',
                    },
                },
            },
        });

        await importCommunes(db, logger, communesCsvFile, cedexCsvFile);

        let links = await externalLinks(db, communes).getLink(stagiaire, 'lbb');
        assert.strictEqual(links, 'https://labonneboite.francetravail.fr/entreprises/commune/84080/rome/A1101?d=30');
    });

    it('should get Offres France Travail link with a formation having a postal code without INSEE mapping', async () => {
        let db = await getTestDatabase();
        db.collection('formacodeRomeMapping').insertOne({
            codeROME: "A1101", label: "Conduite d'engins agricoles et forestiers",
            formacodes: [
                {formacode: "21032", label: "AGROEQUIPEMENT"},
                {formacode: "21043",label: "BUCHERONNAGE"},
                {formacode: "21042",label: "EXPLOITATION FORESTIERE"},
                {formacode: "21011",label: "MACHINISME AGRICOLE"},
                {formacode: "21044",label: "MACHINISME FORESTIER"},
                {formacode: "21034",label: "MACHINISME HORTICOLE"},
                {formacode: "21055",label: "MACHINISME VITICOLE"},
            ]
        });
        let { communes } = await getComponents();
        const stagiaire = newStagiaire({
            formation: {
                domaine_formation: {
                    formacodes: ['21032'],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '84170',
                    },
                },
            },
        });

        await importCommunes(db, logger, communesCsvFile, cedexCsvFile);

        let links = await externalLinks(db, communes).getLink(stagiaire, 'pe');
        assert.strictEqual(links, 'https://candidat.francetravail.fr/offres/recherche?lieux=84080&motsCles=A1101&offresPartenaires=true&rayon=30&tri=0');
    });

    it('should get Offres France Travail link with a formation having a postal code with an INSEE mapping', async () => {
        let db = await getTestDatabase();
        db.collection('formacodeRomeMapping').insertOne({
            codeROME: "A1101", label: "Conduite d'engins agricoles et forestiers",
            formacodes: [
                {formacode: "21032", label: "AGROEQUIPEMENT"},
                {formacode: "21043",label: "BUCHERONNAGE"},
                {formacode: "21042",label: "EXPLOITATION FORESTIERE"},
                {formacode: "21011",label: "MACHINISME AGRICOLE"},
                {formacode: "21044",label: "MACHINISME FORESTIER"},
                {formacode: "21034",label: "MACHINISME HORTICOLE"},
                {formacode: "21055",label: "MACHINISME VITICOLE"},
            ]
        });
        let { communes } = await getComponents();
        const stagiaire = newStagiaire({
            formation: {
                domaine_formation: {
                    formacodes: ['21032'],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '84170',
                    },
                },
            },
        });

        await importCommunes(db, logger, communesCsvFile, cedexCsvFile);

        let links = await externalLinks(db, communes).getLink(stagiaire, 'pe');
        assert.strictEqual(links,
            'https://candidat.francetravail.fr/offres/recherche?lieux=84080&motsCles=A1101&offresPartenaires=true&rayon=30&tri=0');
    });

    it('should get Clara link', async () => {
        let db = await getTestDatabase();
        db.collection('formacodeRomeMapping').insertOne({
            codeROME: "A1101", label: "Conduite d'engins agricoles et forestiers",
            formacodes: [
                {formacode: "21032", label: "AGROEQUIPEMENT"},
                {formacode: "21043",label: "BUCHERONNAGE"},
                {formacode: "21042",label: "EXPLOITATION FORESTIERE"},
                {formacode: "21011",label: "MACHINISME AGRICOLE"},
                {formacode: "21044",label: "MACHINISME FORESTIER"},
                {formacode: "21034",label: "MACHINISME HORTICOLE"},
                {formacode: "21055",label: "MACHINISME VITICOLE"},
            ]
        });
        let { communes } = await getComponents();
        const stagiaire = newStagiaire({
            formation: {
                domaine_formation: {
                    formacodes: ['21032'],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '84170',
                    },
                },
            },
        });

        let links = await externalLinks(db, communes).getLink(stagiaire, 'mesdroitssociaux');
        assert.strictEqual(links, 'https://www.mesdroitssociaux.gouv.fr/');
    });

    it('should get null link when trying to get Offres France Travail link when formation has no formacode', async () => {
        let db = await getTestDatabase();
        db.collection('formacodeRomeMapping').insertOne({
            codeROME: "A1101", label: "Conduite d'engins agricoles et forestiers",
            formacodes: [
                {formacode: "21032", label: "AGROEQUIPEMENT"},
                {formacode: "21043",label: "BUCHERONNAGE"},
                {formacode: "21042",label: "EXPLOITATION FORESTIERE"},
                {formacode: "21011",label: "MACHINISME AGRICOLE"},
                {formacode: "21044",label: "MACHINISME FORESTIER"},
                {formacode: "21034",label: "MACHINISME HORTICOLE"},
                {formacode: "21055",label: "MACHINISME VITICOLE"},
            ]
        });
        let { communes } = await getComponents();
        const stagiaire = newStagiaire({
            formation: {
                domaine_formation: {
                    formacodes: [],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '84170',
                    },
                },
            },
        });

        await importCommunes(db, logger, communesCsvFile, cedexCsvFile);

        assert.strictEqual(await externalLinks(db, communes).getLink(stagiaire, 'pe'), null);
    });

    it('should get null link when trying to get La Bonne Boite link when formation has no formacode', async () => {
        let db = await getTestDatabase();
        db.collection('formacodeRomeMapping').insertOne({
            codeROME: "A1101", label: "Conduite d'engins agricoles et forestiers",
            formacodes: [
                {formacode: "21032", label: "AGROEQUIPEMENT"},
                {formacode: "21043",label: "BUCHERONNAGE"},
                {formacode: "21042",label: "EXPLOITATION FORESTIERE"},
                {formacode: "21011",label: "MACHINISME AGRICOLE"},
                {formacode: "21044",label: "MACHINISME FORESTIER"},
                {formacode: "21034",label: "MACHINISME HORTICOLE"},
                {formacode: "21055",label: "MACHINISME VITICOLE"},
            ]
        });
        let { communes } = await getComponents();
        const stagiaire = newStagiaire({
            formation: {
                domaine_formation: {
                    formacodes: [],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '84170',
                    },
                },
            },
        });

        await importCommunes(db, logger, communesCsvFile, cedexCsvFile);

        assert.strictEqual(await externalLinks(db, communes).getLink(stagiaire, 'lbb'), null);
    });

}));
