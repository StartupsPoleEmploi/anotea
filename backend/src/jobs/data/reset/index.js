#!/usr/bin/env node
'use strict';
const cli = require('commander');
const { execute } = require('../../job-utils');
const resetPasswords = require('./tasks/resetPasswords');
const resetEmails = require('./tasks/resetEmails');

cli.description('Reset data')
.option('--password [password]', 'Password used to reset all accounts')
.option('--emails', 'Reset all emails statuses')
.parse(process.argv);

execute(async ({ db, logger, passwords }) => {

    let stats = {};

    if (cli.password) {
        logger.info('Resetting all passwords...');
        stats.passwords = await resetPasswords(db, passwords, cli.password);
    }

    if (cli.emails) {
        logger.info('Resetting email sent status for stagiaires and organismes...');
        stats.emails = await resetEmails(db);
    }

    return stats;
});
