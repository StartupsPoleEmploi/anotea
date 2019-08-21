#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Import Postal Code <-> City Code INSEE mapping from CSV file')
.option('-p, --postalCodes [postalCodes]', 'The postal codes CSV file to import')
.option('-c, --cedex [cedex]', 'The cedex CSV file to import')
.parse(process.argv);


execute(async ({ logger, db, exit, configuration }) => {

    let postalCodes = require('./importers/postalCodes')(db, logger, configuration);
    let cedex = require('./importers/cedex')(db, logger, configuration);

    if (!cli.postalCodes || !cli.cedex) {
        return exit('invalid arguments');
    }

    // step 1
    await postalCodes.doImport(cli.postalCodes);

    // step 2
    await cedex.doImport(cli.cedex);

    return;
});
