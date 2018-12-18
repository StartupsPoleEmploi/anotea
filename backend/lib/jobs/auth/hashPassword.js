#!/usr/bin/env node
'use strict';

const path = require('path');
const crypto = require('crypto');
const configuration = require('config');
const createLogger = require('../../common/createLogger');
const { hashPassword } = require('../../common/components/password');

const main = async () => {

    const logger = createLogger('anotea-job-auth', configuration);

    let password = process.argv[2];
    if (!password) {
        logger.error(`Password is missing: 'node ${path.basename(__filename)} password'`);
        process.exit(1);
    }

    let sha256 = crypto.createHmac('sha256', configuration.security.secret)
    .update(password)
    .digest('hex');

    console.log(JSON.stringify({
        bcrypt: await hashPassword(password),
        bcrypt_legacy_sha256: await hashPassword(sha256),
    }, null, 2));
};

main();
