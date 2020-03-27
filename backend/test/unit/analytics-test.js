const assert = require('assert');
const { getDeviceType } = require('../../src/http/api/questionnaire/utils/analytics.js');

describe(__filename, () => {
    it('should detect mobile', () => {
        // Android - WebKit
        // TODO : chaine de caractères dans une variable
        assert.deepEqual(getDeviceType('Mozilla/5.0 (Linux; U; Android 2.3.5; zh-cn; HTC_IncredibleS_S710e Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'), {
            phone: true,
            tablet: false,
            desktop: false
        });
    }); 

    it('should detect tablet', () => {
        // iPad - Opera
        assert.deepEqual(getDeviceType('Opera/9.80 (J2ME/MIDP; Opera Mini/4.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/23.411; U; en) Presto/2.5.25 Version/10.54'), {
            phone: false,
            tablet: true,
            desktop: false
        });
    });

    it('should detect desktop', () => {
        // Linux - Chrome
        assert.deepEqual(getDeviceType('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.110 Chrome/58.0.3029.110 Safari/537.36'), {
            phone: false,
            tablet: false,
            desktop: true
        });
    });
});
