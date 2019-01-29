#!/usr/bin/env node
'use strict';

const { execute } = require('../../../job-utils');

execute(async ({ db, logger }) => {

    await db.collection('comment').remove({});

    let cursor = db.collection('trainee').find();
    while (await cursor.hasNext()) {
        const trainee = await cursor.next();

        logger.debug(`Inserting comment for trainee ${trainee._id}`);

        db.collection('comment').insertOne({
            token: trainee.token,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession,
            date: new Date(),
            campaign: trainee.campaign,
            training: trainee.training,
            codeRegion: trainee.codeRegion,
            rates: {
                accueil: 1,
                contenu_formation: 1,
                equipe_formateurs: 1,
                moyen_materiel: 1,
                accompagnement: 1,
                global: 1,
            },
            accord: false,
            accordEntreprise: false,
            step: 2,
        });
    }
});
