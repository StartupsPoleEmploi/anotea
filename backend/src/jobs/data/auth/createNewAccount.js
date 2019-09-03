#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { hashPassword } = require('../../../common/components/password');
const { execute } = require('../../job-utils');

cli.description('Create new account')
.option('--username [username]')
.option('--region [region]')
.option('--profile [profile]')
.option('--password [password]')
.parse(process.argv);

execute(async ({ db, exit }) => {

    let { username, password, region, profile } = cli;

    if (!username || !password || !region || !profile) {
        return exit('Invalid arguments');
    }

    return db.collection('accounts').insertOne({
        courriel: username,
        codeRegion: region,
        profile: profile,
        passwordHash: await hashPassword(password),
        ...(profile === 'moderateur' ? { features: ['EDIT_ORGANISATIONS'] } : {}),
        meta: {
            rehashed: true
        },
    });
});
