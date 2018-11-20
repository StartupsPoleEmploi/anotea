const assert = require('assert');
const { fixData } = require('../../../../jobs/data-fix/fixData.js');

describe('Sanitize advices', function() {

    it('should unescape HTML entities', () => {
        assert.equal(fixData('Formateur très à l&apos;écoute'), 'Formateur très à l\'écoute');
    });

    it('should not alter good data', () => {
        assert.equal(fixData('Je suis très satisfaite'), 'Je suis très satisfaite');
    });

    it('should remove HTML tags', () => {
        assert.equal(fixData('je suis un <strong>h4ck3r</strong>'), 'je suis un h4ck3r');
    });

    it('should remove HTML tags and unescape HTML entities', () => {
        assert.equal(fixData('je suis un <strong>h4ck3r très à l&apos;écoute</strong>'), 'je suis un h4ck3r très à l\'écoute');
    });
});
