let assert = require('assert');

let mockLogger = {
    info: function() {
    }, error: function() {
    }
};
let mockConfiguration = {};

let badwords = require('../../src/http/routes/api/questionnaire/utils/badwords.js')(mockLogger, mockConfiguration);

describe('Badwords', function() {
    describe('isGood', function() {
        it('should find bad words in offensive content', function() {
            assert.ok(!badwords.isGood('le formateur est un connard'));
            assert.ok(!badwords.isGood('fuck'));
            assert.ok(!badwords.isGood('PUTE'));
            assert.ok(!badwords.isGood('salope.'));
            assert.ok(!badwords.isGood('bonjour pute lol'));
            assert.ok(!badwords.isGood('espèce de pompa !!'));
            assert.ok(!badwords.isGood('le prof est un sacré pédophile'));
            assert.ok(!badwords.isGood('moule à gauffre'));
        });
        it('should not find bad words in non-offensive', function() {
            assert.ok(badwords.isGood('titi')); // contains 'tit' but OK
            assert.ok(badwords.isGood('jhabite puteau')); // contains 'bite' and 'pute' but OK
            assert.ok(badwords.isGood('jhabite à Sucé-sur-Erdre')); // contains 'bite'  and 'sucé' but OK
            assert.ok(badwords.isGood('formation très sympatique, je recommande'));
            assert.ok(badwords.isGood('patrick')); // ends with 'trick' but OK
            assert.ok(badwords.isGood('formation très importante.'));
            assert.ok(badwords.isGood('super formation sur le pompage hydraulique'));
            assert.ok(badwords.isGood('formation en pedopsychiatrie enrichissante'));
            assert.ok(badwords.isGood('je me suis fait remouler'));
        });
        it('should not find bad words in empty content', function() {
            assert.ok(badwords.isGood(''));
        });
        it('should throw an exception if content is null or undefined', function() {
            // todo: séparer en deux tests
            let isGoodUndefined = function() {
                badwords.isGood(undefined);
            };
            assert.throws(isGoodUndefined, Error, 'Data must be a string');
            let isGoodNull = function() {
                badwords.isGood(null);
            };
            assert.throws(isGoodNull, Error, 'Data must be a string');
        });
    });
});
