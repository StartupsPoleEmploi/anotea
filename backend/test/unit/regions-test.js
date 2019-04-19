const assert = require('assert');
const regions = require('../../src/common/components/regions');

describe(__filename, () => {

    it('can get can active regions', () => {

        let actives = regions().findActiveRegions();
        assert.deepStrictEqual(actives.map(region => region.codeRegion),
            ['2', '3', '6', '7', '11', '17', '18']);
    });

    it('can find region by code', () => {

        let region = regions().findRegionByCodeRegion('17');
        assert.deepStrictEqual(region, {
            nom: 'Pays de la Loire',
            active: true,
            codeRegion: '17',
            codeINSEE: '52',
            departements: ['44', '53', '49', '85', '72'],
            filters: {},
            mailing: {
                stagiaires: {
                    avis: true
                },
                organismes: {
                    accounts: true,
                    notifications: true
                }
            }
        });
    });

    it('should fail when codeRegion is unknown', () => {

        try {
            regions().findRegionByCodeRegion('UNKNOWN');
            assert.fail('Should have fail');
        } catch (e) {
            assert.strictEqual(e.message, 'Region inconnue pour le code region: UNKNOWN');
        }
    });

    it('can find region by code INSEE', () => {

        let region = regions().findRegionByCodeINSEE('52');
        assert.deepStrictEqual(region, {
            nom: 'Pays de la Loire',
            active: true,
            codeRegion: '17',
            codeINSEE: '52',
            departements: ['44', '53', '49', '85', '72'],
            filters: {},
            mailing: {
                stagiaires: {
                    avis: true
                },
                organismes: {
                    accounts: true,
                    notifications: true
                }
            }
        });
    });

    it('should fail when codeINSEE is unknown', () => {

        try {
            regions().findRegionByCodeINSEE('UNKNOWN');
            assert.fail('Should have fail');
        } catch (e) {
            assert.strictEqual(e.message, 'Region inconnue pour le code INSEE: UNKNOWN');
        }
    });

    it('can find codeRegion by code postal', () => {
        let regionCode = regions().findRegionByPostalCode('72');
        assert.deepStrictEqual(regionCode.codeRegion, '17');
    });

    it('should fail when code postal is unknown', () => {

        try {
            regions().findRegionByPostalCode('00000');
            assert.fail('Should have fail');
        } catch (e) {
            assert.strictEqual(e.message, 'Code region inconnu pour le departement 00');
        }
    });

});
