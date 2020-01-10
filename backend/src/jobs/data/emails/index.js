#!/usr/bin/env node
'use strict';
const cli = require('commander');
const { execute } = require('../../job-utils');
const updateOrganismeKairosCourriels = require('./tasks/updateOrganismeKairosCourriels');
const resendOrganismeEmails = require('./tasks/resendOrganismeEmails');
const fs = require('fs');

cli.description('Reset data')
.option('--update', 'Update emails')
.option('--resend', 'Resend activation emails')
.option('--file [file]', 'The CSV file to import')
.parse(process.argv);

execute(async ({ db, logger, emails, exit }) => {

    let { file, update, resend } = cli;

    if (!file) {
        return exit('invalid arguments');
    }

    let promises = [];

    if (update) {
        let stream = fs.createReadStream(file);
        promises.push(updateOrganismeKairosCourriels(db, logger, stream));
    }

    if (resend) {
        let stream = fs.createReadStream(file);
        promises.push(resendOrganismeEmails(db, logger, emails, stream));
    }

    let res = await Promise.all(promises);
    return {
        updateOrganismeKairosCourriels: res[0],
        resendOrganismeEmails: res[1],
    };
});
