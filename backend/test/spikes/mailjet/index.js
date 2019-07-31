#!/usr/bin/env node
'use strict';

const cli = require('commander');
const moment = require('moment');
const { newTrainee } = require('../../helpers/data/dataset');
const { execute } = require('../../../src/jobs/job-utils');
const mailjet = require('./mailjet');

cli.description('Create, configure and send email campaign with Mailjet')
.option('--init', 'Init mailjet context data')
.option('--api-key [apiKey]', 'publiApiKey:privateApiKey')
.option('--dryrun', 'Send a test email')
.parse(process.argv);

execute(async ({ logger, exit }) => {

    if (!cli.apiKey) {
        return exit('Invalid arguments');
    }

    let [publicApiKey, privateApiKey] = cli.apiKey.split(':');
    let { createContactMetadata, createContacts, createCampaign, sendCampaign } = mailjet(logger, publicApiKey, privateApiKey);

    if (cli.init) {
        await createContactMetadata(cli.init);
    }

    let templateId = 638073;
    let campaignName = `${moment().format('YY-MM-DDTmm:ss')}-test-campaign`;

    logger.info(`Creating contacts for campaign ${campaignName}...`);
    let contactListId = await createContacts(campaignName, [
        newTrainee({
            trainee: {
                name: 'John',
                firstName: 'Doe',
                email: 'test@pe.com',
            },
        }),
    ]);

    logger.info(`Creating campaign ${campaignName}...`);
    let campaignId = await createCampaign(campaignName, contactListId, templateId);

    logger.info(`Sending emails for campaign ${campaignId}...`);
    return sendCampaign(campaignId, { dryRun: cli.dryrun });

});
