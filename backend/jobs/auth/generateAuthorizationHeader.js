#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const AuthService = require('../../components/auth-service');
const getLogger = require('../../components/logger');

/**
 *  Can be launched with the following sample command
 *  `node jobs/auth/generateAuthorizationHeader.js --apiKey admin --secret XXX --method GET --path /api/v1/ping/authenticated`
 *
 **/
const main = async () => {

    const logger = getLogger('anotea-job-auth', configuration);
    let authService = new AuthService(logger, configuration);

    cli.description('Generate an authorization header')
    .option('-k, --apiKey [apiKey]')
    .option('-s, --secret [secret]')
    .option('-m, --method [method]')
    .option('-p, --path [path]')
    .option('-b, --body [body]')
    .parse(process.argv);

    if (!cli.apiKey || !cli.secret || !cli.method || !cli.path) {
        logger.error('Invalid arguments');
        process.exit(1);
    }

    let timestamp = new Date().getTime();
    let signature = await authService.buildHmacDigest(cli.secret, {
        timestamp: timestamp,
        method: cli.method,
        path: cli.path,
        body: cli.body,
    });

    console.log(`ANOTEA-HMAC-SHA256 ${cli.apiKey}:${timestamp}:${signature}`);
};

main();
