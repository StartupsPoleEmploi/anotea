#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db, logger }) => {

    let migrate = async scriptName => {
        logger.info(`Running script ${scriptName}...`);
        return {
            [scriptName]: await require(`./tasks/${scriptName}`)(db),
        };
    };

    return {
        ...(await migrate('reworkStats')),
        ...(await migrate('addLieuxDeFormation')),
        ...(await migrate('removeInvalidAccounts')),
    };
});
