#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../../job-utils');

cli.description('reset email sent status').parse(process.argv);

execute(async ({ logger, db }) => {

    logger.info('Reset email sent status for stagiaires and organismes...');

    return Promise.all([
        db.collection('trainee').updateMany({ avisCreated: false, mailSent: true }, { $set: { mailSent: false } }),
        db.collection('accounts').updateMany({ profile: 'organisme', passwordHash: { $ne: null } }, { $set: { newCommentsNotificationEmailSentDate: null } })
    ]);
});
