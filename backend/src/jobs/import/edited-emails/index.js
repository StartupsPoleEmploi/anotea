#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Import edited email from CSV file')
.option('-f, --file [file]', 'The CSV file to import')
.parse(process.argv);


execute(async ({ logger, db, exit, configuration, mailer }) => {

    let editedCourrielImporter = require(`./importer`)(db, logger, configuration, mailer);

    if (!cli.file) {
        return exit('invalid arguments');
    }

    return editedCourrielImporter.importEditedCourriel(cli.file);
});
