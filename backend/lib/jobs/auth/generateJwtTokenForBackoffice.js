#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const AuthService = require('../../common/components/AuthService');
const createLogger = require('../../common/createLogger');
const createMongoDBClient = require('../../common/createMongoDBClient');


/**
 *  Can be launched with the following sample command
 *  `node jobs/auth/generateJwtToken.js --siret siret`
 *
 **/
const main = async () => {

    let logger = createLogger('anotea-job-auth', configuration);
    let authService = new AuthService(logger, configuration);
    let client = await createMongoDBClient(configuration.mongodb.uri);
    let db = client.db();
    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    cli.description('Generate jwt token')
    .option('-s, --siret [siret]')
    .parse(process.argv);

    if (!cli.siret) {
        logger.error('Invalid arguments');
        process.exit(1);
    }

    try {
        let account = await db.collection('organismes').findOne({ 'meta.siretAsString': cli.siret });
        let data = {
            sub: account.courriel,
            profile: 'moderateur',
            id: account._id,
            codeRegion: account.codeRegion,
        };

        let jwt = await authService.buildJWT('backoffice', data, { expiresIn: '1h' });

        let decoded = await authService.checkJWT('backoffice', jwt.access_token, { expiresIn: '1h' });
        console.log(`Token: ${JSON.stringify(decoded, null, 2)}`);

        await client.close();
    } catch (e) {
        abort(e);
    }
};

main();
