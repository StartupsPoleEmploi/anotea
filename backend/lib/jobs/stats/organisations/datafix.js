#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Fix id for log in events')
.parse(process.argv);

execute(async ({ logger, db, configuration }) => {

    logger.info('Fix id for log in events');

    let organismes = await db.collection('organismes').find().toArray();

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

        db.collection('events').updateOne({ 'source.profile': 'organisme', 'source.user': { $in: emails } }, { $set: { 'source.id': organisme._id } });
    });

});
