const browserstack = require('browserstack-local');

exports.config = {
    'seleniumAddress': 'http://hub-cloud.browserstack.com/wd/hub',

    'capabilities': {
        'browserstack.user': 'yyy',
        'browserstack.key': 'xxx',
        'browserstack.local': true,
        'browserName': 'chrome',
        'build': 'v1',
        'project': 'Login page'
    },

    // Code to start browserstack local before start of test
    'beforeLaunch': () => {
        console.log('Connecting local');
        return new Promise((resolve, reject) => {
            exports.bs_local = new browserstack.Local();
            exports.bs_local.start({ 'key': exports.config.capabilities['browserstack.key'] }, error => {
                if (error) {
                    return reject(error);
                }
                console.log('Connected. Now testing...');

                resolve();
            });
        });
    },

    // Code to stop browserstack local after end of test
    'afterLaunch': () => {
        return new Promise((resolve, reject) => {
            exports.bs_local.stop(resolve);
        });
    },

    'specs': [
        './spec.js'
    ]
};
