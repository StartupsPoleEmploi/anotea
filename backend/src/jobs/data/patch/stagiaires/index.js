#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../../job-utils');
const patchCertifinfos = require('./tasks/patchCertifInfos');
const patchOrganismeResponsable = require('./tasks/patchOrganismeResponsable');

cli.option('--certifInfos [certifInfos]', 'The CSV file with new certifInfos')
.option('--slack', 'Send a slack notification when job is finished')
.parse(process.argv);

execute(async ({ logger, db, exit, sendSlackNotification }) => {

    if (!cli.certifInfos) {
        return exit('certifInfos file is required');
    }

    logger.info(`Patching stagiaires...`);
    let [certifInfos, organismeResponsable] = await Promise.all([
        patchCertifinfos(db, logger, cli.certifInfos),
        patchOrganismeResponsable(db, logger),
    ]);

    sendSlackNotification({
        text: `[STAGIAIRE] ${certifInfos.updated + organismeResponsable.updated} stagiaires mis à jour dont ` +
            `${certifInfos.updated} certiInfos et ${organismeResponsable.updated} sirets`,
    });

    return { certifInfos, organismeResponsable };
}, { slack: cli.slack });
