#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');

cli.description('Generate jwt token')
.option('-c, --courriel [courriel]')
.parse(process.argv);

execute(async ({ db, auth, exit }) => {

    if (!cli.courriel) {
        exit('Invalid arguments');
    }

    let courriel = cli.courriel;
    let moderateur = await db.collection('moderator').findOne({ 'courriel': courriel });
    let data = {
        sub: courriel,
        profile: 'moderateur',
        id: moderateur._id,
        codeRegion: moderateur.codeRegion,
        features: moderateur.features
    };

    let jwt = await auth.buildJWT('backoffice', data, { expiresIn: '1h' });

    return {
        token: `Bearer ${jwt.access_token}`,
    };
});
