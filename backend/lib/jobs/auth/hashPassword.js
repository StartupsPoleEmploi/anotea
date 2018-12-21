#!/usr/bin/env node
'use strict';

const path = require('path');
const crypto = require('crypto');
const { hashPassword } = require('../../common/components/password');
const { execute } = require('../job-utils');

execute(async ({ logger, configuration }) => {

    let password = process.argv[2];
    if (!password) {
        logger.error(`Password is missing: 'node ${path.basename(__filename)} password'`);
        process.exit(1);
    }

    let sha256 = crypto.createHmac('sha256', configuration.security.secret)
    .update(password)
    .digest('hex');

    return {
        bcrypt: await hashPassword(password),
        bcrypt_legacy_sha256: await hashPassword(sha256),
    };
});
