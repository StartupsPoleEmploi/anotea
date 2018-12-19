#!/usr/bin/env node
'use strict';

const configuration = require('config');
const AuthService = require('../../common/components/AuthService');
const createLogger = require('../../common/createLogger');


/**
 *  Can be launched with the following sample command
 *  `node jobs/auth/generateJwtToken.js --siret siret`
 *
 **/
const main = async () => {

    let logger = createLogger('anotea-job-auth', configuration);
    let authService = new AuthService(logger, configuration);
    const abort = message => {
        logger.error(message);
    };

    try {
        let data = {
            sub: 'kairos',
            iat: Math.floor(Date.now() / 1000),
        };

        let jwt = await authService.buildJWT('kairos', data);

        console.log(`\nBearer ${jwt.access_token}\n`);

    } catch (e) {
        abort(e);
    }
};

main();
