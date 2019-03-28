const assert = require('assert');
const path = require('path');
const getFormations = require('../../../../../src/jobs/import/intercarif/utils/getFormationsFromXml');
const regions = require('../../../../../src/common/components/regions');

describe(__filename, () => {

    const extractFormation = callback => {
        let file = path.join(__dirname, '../../../../helpers/data', 'intercarif-data-test.xml');
        getFormations(file, regions())
        .first()
        .subscribe(
            document => callback(document),
            err => assert.fail('Unable to extract document from xml', err),
            () => ({})
        );
    };

    it('should add md5 to each document', done => {

        extractFormation(document => {
            assert.ok(document.md5);
            assert.strictEqual(document.md5.constructor.name, 'String');
            assert.strictEqual(document.md5.length, 32);
            done();
        });
    });

    it('should store xml attributes into _attributes', done => {

        extractFormation(document => {
            assert.deepStrictEqual(document._attributes, {
                numero: 'F_XX_XX',
                datecrea: '20010503',
                datemaj: '20171213',
                file: 'https://anotea.pole-emploi.fr',
                href: 'https://anotea.pole-emploi.fr'
            });
            done();
        });
    });

    it('should lower case tags (eg. FORMACODE, SIRET, NSF, ROME) and text value into _value', done => {

        extractFormation(document => {
            assert.deepStrictEqual(document.domaine_formation, {
                code_formacodes: [
                    {
                        _value: '22403',
                        _attributes: {
                            ref: 'V12',
                            tag: 'principal'
                        }
                    }
                ],
                code_nsfs: [
                    '233'
                ],
                code_romes: [
                    'F1604'
                ]
            });
            assert.deepStrictEqual(document.organisme_formation_responsable.siret_organisme_formation.siret, '11111111111111');
            done();
        });
    });

    it('should convert action and session tags into array', done => {

        extractFormation(document => {
            assert.deepStrictEqual(document.actions.length, 1);
            assert.deepStrictEqual(document.actions[0].sessions.length, 1);
            done();
        });
    });

    it('should add _meta', done => {

        extractFormation(document => {
            assert.deepStrictEqual(document._meta, {
                certifinfos: ['80735'],
                formacodes: ['22403']
            });
            done();
        });
    });

    it('should add codeRegion', done => {
        extractFormation(document => {
            assert.deepStrictEqual(document.actions[0].lieu_de_formation.coordonnees.adresse.code_region, '11');
            done();
        });
    });
});
