#!/usr/bin/env node
"use strict";

const cli = require("commander");
const { execute } = require("../../job-utils");
const importCommunes = require("./tasks/importCommunes");

cli
.option("--communes [communes]", "The postal codes CSV file to import")
.option("--cedex [cedex]", "The cedex CSV file to import")
.parse(process.argv);

execute(async ({ logger, db, exit }) => {

    if (!cli.communes || !cli.cedex) {
        return exit("Invalid arguments");
    }

    let stats = {};
    stats.importCommunes = await importCommunes(db, logger, cli.communes, cli.cedex);
    return stats;
});
