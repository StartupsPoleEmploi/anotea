#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../../job-utils');
const resetPasswords = require('./resetPasswords');

cli.description('Reset password')
.option('-p, --password [password]', 'Password for injected accounts')
.parse(process.argv);

execute(async ({ db, exit }) => {

    if (!cli.password) {
        exit('Invalid arguments');
    }

    return resetPasswords(db, cli.password);
});
