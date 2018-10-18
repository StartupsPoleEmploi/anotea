const assert = require('assert');

const { buildDate } = require('../../components/dataParsing')();

describe('dataParsing', function() {
    describe('buildDate', function() {
        it('should get a valid Date from a valid string', function() {
            assert.deepEqual(buildDate('20140226'), new Date(2014, 02, 26))
        });
        it('should get a null value from an undefined parameter', function() {
            assert.equal(buildDate(undefined), null)
        });
        it('should get a null value from a "00000000" string', function() {
            assert.equal(buildDate("00000000"), null)
        });
        it('should return an invalid Date with invalid string', function() {
            assert.equal(buildDate("ba"), "Invalid Date")
            assert.equal(buildDate("bad sdf jlkqsdfjl qsldf"), "Invalid Date")
        });
    })
})