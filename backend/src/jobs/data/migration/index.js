#!/usr/bin/env node
"use strict";
const { execute } = require("../../job-utils");
const cli = require("commander");

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.markPropertiesAsDeprecated = await require("./tasks/markPropertiesAsDeprecated")(db);
    stats.removeInvalidOrganismes = await require("./tasks/removeInvalidOrganismes")(db);
    return stats;
});
