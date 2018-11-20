const assert = require('assert');
const { sanitize } = require('../../components/userInput.js');

describe('Sanitize user input', function() {

    it('should unescape HTML entities', () => {
        assert.equal(sanitize('Formateur très à l&apos;écoute'), 'Formateur très à l\'écoute');
    });

    it('should not alter good data', () => {
        assert.equal(sanitize('Je suis très satisfaite'), 'Je suis très satisfaite');
    });

    it('should not alter good data with punctuation', () => {
        assert.equal(sanitize('Formateur très à l\'écoute'), 'Formateur très à l\'écoute');
    });

    it('should remove HTML tags', () => {
        assert.equal(sanitize('je suis un <strong>h4ck3r</strong>'), 'je suis un h4ck3r');
    });

    it('should remove HTML tags and unescape HTML entities', () => {
        assert.equal(sanitize('je suis un <strong>h4ck3r très à l&apos;écoute</strong>'), 'je suis un h4ck3r très à l\'écoute');
    });

    it('should remove emoj', () => {
        assert.equal(sanitize('trop rigolo 😂😂😂'), 'trop rigolo ');
    });
});
