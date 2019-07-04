const assert = require('assert');
const { getAnonymizedTitle } = require('../../../../../src/jobs/data/anonymous/utils')();

describe(__filename, () => {
    it('should remove name, firstname and Pôle Emploi ID', () => {
        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'ANGELIQUE'
            },
            training: {
                title: 'CAP PETITE ENFANCE-TOTO ANGELIQUE 3222222V'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP PETITE ENFANCE');
    });

    it('should remove name and firstname', () => {

        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'ANGELIQUE'
            },
            training: {
                title: 'CAP PETITE ENFANCE-TOTO ANGELIQUE'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP PETITE ENFANCE');
    });

    it('should remove Pôle Emploi ID : 7 numbers + 1 letter', () => {

        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'ANGELIQUE'
            },
            training: {
                title: 'CAP PETITE ENFANCE - 3222222V'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP PETITE ENFANCE');
    });

    it('should remove Pôle Emploi ID : 8 numbers', () => {

        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'ANGELIQUE'
            },
            training: {
                title: 'CAP PETITE ENFANCE - 32222222'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP PETITE ENFANCE');
    });

    it('should remove name and firstname with diacritics', () => {

        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'ANGELIQUE'
            },
            training: {
                title: 'CAP PETITE ENFANCE - Angélique Toto'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP PETITE ENFANCE');
    });

    it('should remove AIF and CSP occurences', () => {

        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'ANGELIQUE'
            },
            training: {
                title: 'CAP PETITE ENFANCE - AIF CSP Angélique Toto'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP PETITE ENFANCE');
    });

    it('should remove Mme occurences', () => {

        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'ANGELIQUE'
            },
            training: {
                title: 'CAP PETITE ENFANCE - Mme Angélique Toto'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP PETITE ENFANCE');
    });

    it('should remove marc firstname occurences', () => {

        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'MARC'
            },
            training: {
                title: 'CAP BOULANGERIE marc toto'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP BOULANGERIE');
    });

    it('should not remove marc occurences inside words', () => {

        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'ANGELIQUE'
            },
            training: {
                title: 'CAP MARCHANDISE'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP MARCHANDISE');
    });

    it('should not remove unknown firstname or name', () => {

        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'ANGELIQUE'
            },
            training: {
                title: 'CAP PETITE ENFANCE - Angélique Toto Saint François'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP PETITE ENFANCE    SAINT FRANCOIS');
    });

    it('should not remove training numbers', () => {

        const result = getAnonymizedTitle({
            trainee: {
                name: 'TOTO',
                firstName: 'ANGELIQUE'
            },
            training: {
                title: 'CAP PETITE ENFANCE CERT 12345'
            }
        });
        
        assert.deepEqual(result.anonymizedTitle, 'CAP PETITE ENFANCE CERT 12345');
    });
});
