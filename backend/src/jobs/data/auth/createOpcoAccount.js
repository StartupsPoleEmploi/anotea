#!/usr/bin/env node
'use strict';

const { program: cli } = require('commander');
const { execute } = require('../../job-utils');

cli.description('Create new account')
.option('--identifiant [identifiant]')
.option('--codeOpco [codeOpco]')
.option('--password [password]')
.parse(process.argv);

execute(async ({ db, exit, passwords }) => {

    let { identifiant, password, codeOpco } = cli.opts();

    if (!identifiant || !password || !codeOpco) {
        return exit('Invalid arguments');
    }

    return db.collection('accounts').insertOne({
        profile: 'opco',
        identifiant,
        courriel: identifiant,
        codeOpco: codeOpco,
        codeRegion: '11',
        codeFinanceur: '16',
        passwordHash: await passwords.hashPassword(password),
        meta: {
            rehashed: true
        },
    });
});
