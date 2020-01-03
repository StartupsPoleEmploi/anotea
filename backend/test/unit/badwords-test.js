let assert = require('assert');

let mockLogger = {
    info: function() {
    }, error: function() {
    }
};

let badwords = require('../../src/http/api/questionnaire/utils/badwords.js')(mockLogger);

describe('Badwords', () => {
    it('should find bad words in offensive content', async () => {
        assert.ok(!await badwords.isGood('le formateur est un connard'));
        assert.ok(!await badwords.isGood('fuck'));
        assert.ok(!await badwords.isGood('PUTE'));
        assert.ok(!await badwords.isGood('salope.'));
        assert.ok(!await badwords.isGood('bonjour pute lol'));
        assert.ok(!await badwords.isGood('espèce de pompa !!'));
        assert.ok(!await badwords.isGood('le prof est un sacré pédophile'));
        assert.ok(!await badwords.isGood('moule à gauffre'));
        assert.ok(!await badwords.isGood('arnaque'));
    });
    it('should not find bad words in non-offensive', async () => {
        assert.ok(await badwords.isGood('titi')); // contains 'tit' but OK
        assert.ok(await badwords.isGood('jhabite puteau')); // contains 'bite' and 'pute' but OK
        assert.ok(await badwords.isGood('jhabite à Sucé-sur-Erdre')); // contains 'bite'  and 'sucé' but OK
        assert.ok(await badwords.isGood('formation très sympatique, je recommande'));
        assert.ok(await badwords.isGood('patrick')); // ends with 'trick' but OK
        assert.ok(await badwords.isGood('formation très importante.'));
        assert.ok(await badwords.isGood('super formation sur le pompage hydraulique'));
        assert.ok(await badwords.isGood('formation en pedopsychiatrie enrichissante'));
        assert.ok(await badwords.isGood('je me suis fait remouler'));
    });
    it('should not find bad words in empty content', async () => {
        assert.ok(await badwords.isGood(''));
    });
    it('should handle null or undefined', async () => {
        assert.ok(!await badwords.isGood(null));
        assert.ok(!await badwords.isGood(undefined));
    });
});
