#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { hashPassword } = require('../../common/components/password');
const { execute } = require('../job-utils');

cli.description('Prepare new account')
.option('--email [email]')
.option('--region [region]')
.option('--password [password]')
.parse(process.argv);

execute(async ({ exit }) => {

    let { email, password, region } = cli;

    if (!email || !password || !region) {
        exit('Invalid arguments');
    }

    console.log(JSON.stringify({
        courriel: email,
        codeRegion: region,
        features: ['EDIT_ORGANISATIONS'],
        profile: 'moderateur',
        passwordHash: await hashPassword(password),
        meta: {
            rehashed: true
        },
    }, null, 2));
});
