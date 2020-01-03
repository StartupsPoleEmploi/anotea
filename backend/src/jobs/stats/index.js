#!/usr/bin/env node
"use strict";

const cli = require("commander");
const { execute } = require("../job-utils");
const computeStats = require("./tasks/computeStats");

cli.parse(process.argv);

execute(async ({ db, regions }) => {
    return computeStats(db, regions);
});
