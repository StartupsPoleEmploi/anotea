#!/usr/bin/env node
'use strict';

const cli = require('commander');
const crypto = require('crypto');
const { execute } = require('../../job-utils');

cli.description('Generate an authorization header')
.option('-k, --apiKey [apiKey]')
.option('-s, --secret [secret]')
.option('-m, --method [method]')
.option('-p, --path [path]')
.option('-b, --body [body]')
.parse(process.argv);

execute(async ({ exit }) => {

    if (!cli.apiKey || !cli.secret || !cli.method || !cli.path) {
        exit('Invalid arguments');
    }

    let timestamp = new Date().getTime();
    let signature = crypto.createHmac('sha256', cli.secret)
    .update(`${timestamp}${cli.method}${cli.path}${cli.body ? cli.body : ''}`)
    .digest('hex');

    return {
        'Authorization': `ANOTEA-HMAC-SHA256 ${cli.apiKey}:${timestamp}:${signature}`
    };

});
