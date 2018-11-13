#!/usr/bin/env node
'use strict';

const cli = require('commander');
const crypto = require('crypto');

/**
 *  Can be launched with the following sample command
 *  `node jobs/auth/generateAuthorizationHeader.js --apiKey admin --secret XXX --method GET --path /api/v1/ping/authenticated`
 *
 **/
const main = async () => {

    cli.description('Generate an authorization header')
    .option('-k, --apiKey [apiKey]')
    .option('-s, --secret [secret]')
    .option('-m, --method [method]')
    .option('-p, --path [path]')
    .option('-b, --body [body]')
    .parse(process.argv);

    if (!cli.apiKey || !cli.secret || !cli.method || !cli.path) {
        console.error('Invalid arguments');
        process.exit(1);
    }

    let timestamp = new Date().getTime();
    let signature = crypto.createHmac('sha256', cli.secret)
    .update(`${timestamp}${cli.method}${cli.path}${cli.body ? cli.body : ''}`)
    .digest('hex');

    console.log(`ANOTEA-HMAC-SHA256 ${cli.apiKey}:${timestamp}:${signature}`);
};

main();
