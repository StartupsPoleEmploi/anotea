const assert = require('assert');
const { isPasswordStrongEnough, hashPassword, verifyPassword, getAlgorithm } = require('../../lib/common/components/password.js');

describe('Password', function() {

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

    it('can hash password with bcrypt (10 rounds)', async () => {
        let hash = await hashPassword('azertY!');
        assert.equal(hash.substring(0, 7), getAlgorithm());
    });

    it('can verify hash', async () => {
        let password = 'azertY!';
        let hash = await hashPassword(password);

        assert.ok(await verifyPassword(password, hash));
    });
});
