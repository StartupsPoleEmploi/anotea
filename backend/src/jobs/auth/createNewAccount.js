#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { hashPassword } = require('../../common/components/password');
const { execute } = require('../job-utils');

cli.description('Create new account')
.option('--email [email]')
.option('--region [region]')
.option('--profile [profile]')
.option('--password [password]')
.parse(process.argv);

execute(async ({ db, exit }) => {

    let { email, password, region, profile } = cli;

    if (!email || !password || !region || !profile) {
        return exit('Invalid arguments');
    }

    return db.collection('accounts').insertOne({
        courriel: email,
        codeRegion: region,
        profile: profile,
        passwordHash: await hashPassword(password),
        ...(profile === 'moderateur' ? { features: ['EDIT_ORGANISATIONS'] } : {}),
        meta: {
            rehashed: true
        },
    });
});
