#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const { hashPassword } = require('../../components/password');
const getLogger = require('../../components/logger');

const main = async () => {

    let logger = getLogger('anotea-job-auth', configuration);
    cli.description('Generate an bcrypt password')
    .option('-p, --password [password]')
    .parse(process.argv);

    if (!cli.password) {
        logger.error('Invalid arguments');
        process.exit(1);
    }

    console.log(hashPassword(cli.password));
};

main();
