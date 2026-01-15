#!/usr/bin/env node
'use strict';

const { program: cli } = require('commander');
const { execute } = require('../../job-utils');

cli.description('Create new account')
.option('--identifiant [identifiant]')
.option('--region [region]')
.option('--codeFinanceur [codeFinanceur]')
.option('--password [password]')
.parse(process.argv);

execute(async ({ db, exit, passwords }) => {

    let { identifiant, password, region, codeFinanceur } = cli.opts();

    if (!identifiant || !password || !region || !codeFinanceur) {
        return exit('Invalid arguments');
    }

    return db.collection('accounts').insertOne({
        profile: 'financeur',
        identifiant,
        courriel: identifiant,
        codeRegion: region,
        codeFinanceur,
        passwordHash: await passwords.hashPassword(cli.password),
        meta: {
            rehashed: true
        },
    });
});
