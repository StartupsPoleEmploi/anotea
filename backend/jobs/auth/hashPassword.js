#!/usr/bin/env node
'use strict';

const path = require('path');
const crypto = require('crypto');
const configuration = require('config');
const getLogger = require('../../components/logger');
const { hashPassword } = require('../../components/password');

const main = async () => {

    const logger = getLogger('anotea-job-auth', configuration);

    let password = process.argv[2];
    if (!password) {
        logger.error(`Password is missing: 'node ${path.basename(__filename)} password'`);
        process.exit(1);
    }

    let sha256 = crypto.createHmac('sha256', configuration.security.secret)
    .update(password)
    .digest('hex');

    console.log(`bcrypt: ${await hashPassword(password)}`);
    console.log(`sha256: ${sha256}`);
};

main();
