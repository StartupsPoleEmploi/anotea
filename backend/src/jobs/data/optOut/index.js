#!/usr/bin/env node
'use strict';
const { program: cli } = require('commander');
const { execute } = require('../../job-utils');
const optOutStagiaire = require('./tasks/optOutStagiaire');

cli.description('Opt-out a stagiaire')
.option('--email [email]', 'Email to add to the opt-out list')
.parse(process.argv);

const { email } = cli.opts();

execute(async ({ db, exit }) => {

    if (!cli.email) {
        return exit('Invalid arguments');
    }

    return optOutStagiaire(db, email);
});
