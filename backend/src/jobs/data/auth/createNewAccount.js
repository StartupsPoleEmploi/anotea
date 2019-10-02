#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Create new account')
.option('--username [username]')
.option('--region [region]')
.option('--profile [profile]')
.option('--password [password]')
.parse(process.argv);

execute(async ({ db, exit, passwords }) => {

    let { username, password, region, profile } = cli;

    if (!username || !password || !region || !profile) {
        return exit('Invalid arguments');
    }

    return db.collection('accounts').insertOne({
        courriel: username,
        codeRegion: region,
        profile: profile,
        passwordHash: await passwords.hashPassword(cli.password),
        ...(profile === 'moderateur' ? { features: ['EDIT_ORGANISATIONS'] } : {}),
        meta: {
            rehashed: true
        },
    });
});
