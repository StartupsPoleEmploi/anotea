#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { hashPassword } = require('../../../common/components/password');
const { execute } = require('../../job-utils');

cli.description('Reset password')
.parse(process.argv);

execute(async ({ db }) => {

    let password = process.argv[2];
    let hash = await hashPassword(password);

    return Promise.all([
        db.collection('financer').updateMany({ passwordHash: { $ne: null } }, {
            $set: {
                'meta.rehashed': true,
                'passwordHash': hash,
            }
        }),
        db.collection('moderator').updateMany({ passwordHash: { $ne: null } }, {
            $set: {
                'meta.rehashed': true,
                'passwordHash': hash,
            }
        }),
        db.collection('organismes').updateMany({ passwordHash: { $ne: null } }, {
            $set: {
                'meta.rehashed': true,
                'passwordHash': hash,
            }
        }),
    ]);
});
