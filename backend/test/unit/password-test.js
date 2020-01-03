const assert = require('assert');
const config = require('config');
const passwords = require('../../src/core/components/passwords.js');

describe('Password', function() {

    let { isPasswordStrongEnough, hashPassword, checkPassword } = passwords(config);

    it('should get true with a valid password', () => {
        assert.ok(isPasswordStrongEnough('azertY!'));
    });
    it('should get false with an invalid password', function() {
        assert.ok(!isPasswordStrongEnough('azert'));
        assert.ok(!isPasswordStrongEnough('Azert'));
        assert.ok(!isPasswordStrongEnough('#azert'));
        assert.ok(!isPasswordStrongEnough('#Az'));
        assert.ok(isPasswordStrongEnough('#Azerty'));
    });

    it('can compare password and hash', async () => {
        let password = 'azertY!';
        let hash = await hashPassword(password);

        assert.ok(await checkPassword(password, hash));
    });
});
