#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Create new account')
.option('--identifiant [identifiant]')
.option('--region [region]')
.option('--profile [profile]')
.option('--codeFinanceur [codeFinanceur]')
.option('--password [password]')
.parse(process.argv);

execute(async ({ db, exit, passwords }) => {

    let { identifiant, password, region, profile, codeFinanceur } = cli;

    if (!identifiant || !password || !region || !profile) {
        return exit('Invalid arguments');
    }

    if (profile === 'financeur' && !codeFinanceur) {
        return exit('Invalid arguments');
    }

    return db.collection('accounts').insertOne({
        courriel: identifiant,
        codeRegion: region,
        profile: profile,
        passwordHash: await passwords.hashPassword(cli.password),
        ...(profile === 'financeur' ? { codeFinanceur } : {}),
        meta: {
            rehashed: true
        },
    });
});
