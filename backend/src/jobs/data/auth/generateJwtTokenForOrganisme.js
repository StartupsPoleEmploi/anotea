#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Generate jwt token')
.option('-s, --siret [siret]')
.parse(process.argv);

execute(async ({ db, auth, exit }) => {

    if (!cli.siret) {
        exit('Invalid arguments');
    }

    let organisme = await db.collection('accounts').findOne({
        'siret': cli.siret,
        'profile': 'organisme'
    });
    let data = {
        sub: organisme.courriel,
        profile: 'organisme',
        id: organisme._id,
        codeRegion: organisme.codeRegion,
        raison_sociale: organisme.raison_sociale,
        siret: organisme.siret,
    };

    let jwt = await auth.buildJWT('backoffice', data, { expiresIn: '1h' });

    return {
        token: `Bearer ${jwt.access_token}`,
    };
});
