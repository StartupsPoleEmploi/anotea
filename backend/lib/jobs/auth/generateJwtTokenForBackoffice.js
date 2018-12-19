#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');

cli.description('Generate jwt token')
.option('-s, --siret [siret]')
.parse(process.argv);

execute(async ({ db, authService, exit }) => {

    if (!cli.siret) {
        exit('Invalid arguments');
    }

    let account = await db.collection('organismes').findOne({ 'meta.siretAsString': cli.siret });
    let data = {
        sub: account.courriel,
        profile: 'moderateur',
        id: account._id,
        codeRegion: account.codeRegion,
    };

    let jwt = await authService.buildJWT('backoffice', data, { expiresIn: '1h' });

    return authService.checkJWT('backoffice', jwt.access_token, { expiresIn: '1h' });
});
