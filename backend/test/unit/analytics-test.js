let assert = require('assert');

let mockDb = null;
let mockLogger = {
    info: function() {
    }, error: function() {
    }
};
let mockConfiguration = {
    'redis': {
        'host': 'localhost',
        'port': 6379
    }
};

// mettre les fichiers tests à côté des fichiers test

let analytics = require('../../components/analytics.js')(mockDb, mockLogger, mockConfiguration);

describe('analytics', function() {
    describe('getDeviceType', function() {
        it('should detect mobile', function() {
            // Android - WebKit
            // TODO : chaine de caractères dans une variable
            assert.deepEqual(analytics.getDeviceType('Mozilla/5.0 (Linux; U; Android 2.3.5; zh-cn; HTC_IncredibleS_S710e Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'), {
                phone: true,
                tablet: false,
                desktop: false
            });
        });
        it('should detect tablet', function() {
            // iPad - Opera
            assert.deepEqual(analytics.getDeviceType('Opera/9.80 (J2ME/MIDP; Opera Mini/4.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/23.411; U; en) Presto/2.5.25 Version/10.54'), {
                phone: false,
                tablet: true,
                desktop: false
            });
        });
        it('should detect desktop', function() {
            // Linux - Chrome
            assert.deepEqual(analytics.getDeviceType('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.110 Chrome/58.0.3029.110 Safari/537.36'), {
                phone: false,
                tablet: false,
                desktop: true
            });
        });
    });
});
