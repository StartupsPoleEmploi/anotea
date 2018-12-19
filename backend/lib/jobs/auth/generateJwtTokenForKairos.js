#!/usr/bin/env node
'use strict';

const { execute } = require('../job-utils');

execute(async ({ authService }) => {

    let jwt = await authService.buildJWT('kairos', {
        sub: 'kairos',
        iat: Math.floor(Date.now() / 1000),
    });

    return {
        token: `Bearer ${jwt.access_token}`,
    };
});
