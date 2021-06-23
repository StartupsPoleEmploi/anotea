#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Create new account')
.option('--identifiant [identifiant]')
.option('--region [region]')
.option('--password [password]')
.parse(process.argv);

execute(async ({ db, exit, passwords }) => {

    let { identifiant, password, region } = cli;

    if (!identifiant || !password || !region) {
        return exit('Invalid arguments');
    }

    return db.collection('accounts').insertOne({
        profile: 'moderateur',
        identifiant,
        courriel: identifiant,
        codeRegion: region,
        passwordHash: await passwords.hashPassword(cli.password),
        meta: {
            rehashed: true
        },
    });
});
