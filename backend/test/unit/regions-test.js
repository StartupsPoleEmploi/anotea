const assert = require('assert');
const regions = require('../../src/core/components/regions');

describe(__filename, () => {

    it('can find region by code', () => {

        let region = regions().findRegionByCodeRegion('52');
        assert.deepStrictEqual(region, {
            nom: 'Région Pays de la Loire',
            active: true,
            since: '2017-07-01',
            codeRegion: '52',
            contact: 'anotea-pdll.44116',
            departements: [
                {
                    code: '44',
                    label: 'Loire-Atlantique'
                },
                {
                    code: '53',
                    label: 'Mayenne'
                },
                {
                    code: '49',
                    label: 'Maine-et-Loire'
                },
                {
                    code: '85',
                    label: 'Vendée'
                },
                {
                    code: '72',
                    label: 'Sarthe'
                }
            ],
            mailing: {
                stagiaires: {
                    avis: true
                },
                organismes: {
                    accounts: true,
                    notifications: true
                }
            },
            conseil_regional: {
                active: true,
                import: 'all',
            },
            carif: {
                nom: 'Choisir mon metier en Pays de la Loire',
                url: 'http://www.orientation-paysdelaloire.fr/',
                active: true
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

    it('can find codeRegion by code postal', () => {
        let regionCode = regions().findRegionByPostalCode('72');
        assert.deepStrictEqual(regionCode.codeRegion, '52');
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
