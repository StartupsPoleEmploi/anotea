#!/usr/bin/env node
'use strict';
const { program: cli } = require('commander');
const { execute } = require('../../job-utils');
const resetPasswords = require('./tasks/resetPasswords');
const resetEmails = require('./tasks/resetEmails');

cli.description('Reset data')
.option('--password [password]', 'Password used to reset all accounts')
.option('--emails', 'Reset all emails statuses')
.parse(process.argv);

const { password, emails } = cli.opts();

execute(async ({ db, logger, passwords }) => {

    let stats = {};

    if (password) {
        logger.info('Resetting all passwords...');
        stats.passwords = await resetPasswords(db, passwords, password);
    }

    if (emails) {
        logger.info('Resetting email sent status for stagiaires and organismes...');
        stats.emails = await resetEmails(db);
    }

    return stats;
});
