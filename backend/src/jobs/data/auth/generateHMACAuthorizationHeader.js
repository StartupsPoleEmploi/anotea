#!/usr/bin/env node
"use strict";

const cli = require("commander");
const { execute } = require("../../job-utils");
const buildHMACSignature = require("./utils/buildHMACSignature");

cli.description("Generate an authorization header")
.option("-k, --apiKey [apiKey]")
.option("-s, --secret [secret]")
.option("-m, --method [method]")
.option("-p, --path [path]")
.option("-b, --body [body]")
.parse(process.argv);

execute(async ({ exit }) => {

    let { apiKey, secret, method, path, body } = cli;

    if (!apiKey || !secret || !method || !path) {
        exit("Invalid arguments");
    }

    return {
        "Authorization": buildHMACSignature(apiKey, secret, { method, path, body }),
    };

});
