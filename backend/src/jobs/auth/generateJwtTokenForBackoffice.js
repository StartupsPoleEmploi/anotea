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

    let account = await db.collection('organismes').findOne({ 'meta.siretAsString': cli.siret });
    let data = {
        sub: account.courriel,
        profile: 'moderateur',
        id: account._id,
        codeRegion: account.codeRegion,
    };

    let jwt = await auth.buildJWT('backoffice', data, { expiresIn: '1h' });

    return auth.checkJWT('backoffice', jwt.access_token, { expiresIn: '1h' });
});
