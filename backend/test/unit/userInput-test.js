const assert = require('assert');
const { sanitize } = require('../../src/http/api/questionnaire/utils/userInput.js');

describe('Sanitize user input', function() {

    it('should unescape HTML entities', () => {
        assert.strictEqual(sanitize('Formateur très à l&apos;écoute'), 'Formateur très à l\'écoute');
    });

    it('should unescape and remove HTML tags', () => {
        assert.strictEqual(sanitize('&lt;script&gt;alert(\\"xss\\");&lt;/script&gt;'), 'alert(\\"xss\\");');
    });

    it('should not alter good data', () => {
        assert.strictEqual(sanitize('Je suis très satisfaite'), 'Je suis très satisfaite');
    });

    it('should not alter good data with punctuation', () => {
        assert.strictEqual(sanitize('Formateur très à l\'écoute'), 'Formateur très à l\'écoute');
    });

    it('should remove HTML tags', () => {
        assert.strictEqual(sanitize('je suis un <strong>h4ck3r</strong>'), 'je suis un h4ck3r');
    });

    it('should remove HTML tags and unescape HTML entities', () => {
        assert.strictEqual(sanitize('je suis un <strong>h4ck3r très à l&apos;écoute</strong>'), 'je suis un h4ck3r très à l\'écoute');
    });

    it('should remove emoj', () => {
        assert.strictEqual(sanitize('trop rigolo 😂😂😂✌✌'), 'trop rigolo');
    });

    it('should trim', () => {
        assert.strictEqual(sanitize(' trop rigolo '), 'trop rigolo');
    });
});
