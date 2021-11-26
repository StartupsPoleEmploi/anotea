const assert = require('assert');
const config = require('config');
const passwords = require('../../src/core/components/passwords.js');

describe('Password', function() {

    let { isPasswordStrongEnough, hashPassword, checkPassword } = passwords(config);

    it('should get true with a valid password', () => {
        assert.ok(isPasswordStrongEnough('azertY1!'));
    });
    it('should get false with an invalid password', function() {
        assert.ok(!isPasswordStrongEnough('#AZERTY12')); // pas de lettre minuscule
        assert.ok(!isPasswordStrongEnough('Azerty123')); // pas de caractère spécial
        assert.ok(!isPasswordStrongEnough('#azert123')); // pas de lettre majuscule
        assert.ok(!isPasswordStrongEnough('#Azertyui')); // pas de chiffre
        assert.ok(!isPasswordStrongEnough('#Azer1!'));   // pas assez long
    });

    it('can compare password and hash', async () => {
        let password = 'azertY2!';
        let hash = await hashPassword(password);

        assert.ok(await checkPassword(password, hash));
    });
});
