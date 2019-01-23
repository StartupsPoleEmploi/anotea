#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');

cli.description('Generate jwt token')
.option('-s, --siret [siret]')
.parse(process.argv);

execute(async ({ db, auth, exit }) => {

    if (!cli.siret) {
        exit('Invalid arguments');
    }

    let organisme = await db.collection('organismes').findOne({ 'meta.siretAsString': cli.siret });
    let data = {
        sub: organisme.courriel,
        profile: 'organisme',
        id: organisme._id,
        codeRegion: organisme.codeRegion,
        raisonSociale: organisme.raisonSociale,
        siret: organisme.meta.siretAsString
    };

    let jwt = await auth.buildJWT('backoffice', data, { expiresIn: '1h' });

    return {
        token: `Bearer ${jwt.access_token}`,
    };
});
