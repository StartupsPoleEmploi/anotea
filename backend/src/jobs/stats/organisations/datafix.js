#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Fix id for log in events')
.parse(process.argv);

execute(async ({ logger, db, configuration }) => {

    logger.info('Fix id for log in events');

    let organismes = await db.collection('account').find({ profile: 'organisme' }).toArray();

    organismes.forEach(organisme => {
        let emails = [];
        if (organisme.courrielsSecondaires !== undefined) {
            organisme.courrielsSecondaires.forEach(email => {
                emails.push(email);
            });
        }
        emails.push(organisme.courriel);
        if (organisme.meta.kairosData !== undefined) {
            emails.push(organisme.meta.kairosData.emailRGC);
        }

        db.collection('events').updateMany({ 'source.profile': 'organisme', $or: [{ 'source.user': { $in: emails } }, { 'source.user': organisme.meta.siretAsString }] }, { $set: { 'source.id': organisme.meta.siretAsString } }, { multi: true });
    });

});
