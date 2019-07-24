#!/usr/bin/env node
'use strict';
const cli = require('commander');
const { hashPassword } = require('../../../../common/components/password');
const { execute } = require('../../../job-utils');

cli.description('Reset password')
.option('-p, --password [password]', 'Password for injected accounts')
.parse(process.argv);

execute(async ({ db, exit }) => {

    if (!cli.password) {
        return exit('Invalid arguments');
    }

    return Promise.all([
        db.collection('accounts').updateMany({ passwordHash: { $ne: null } }, {
            $set: {
                'meta.rehashed': true,
                'passwordHash': await hashPassword(cli.password),
            }
        }),
    ]);
});
