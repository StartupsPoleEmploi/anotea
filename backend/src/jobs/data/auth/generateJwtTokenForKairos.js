#!/usr/bin/env node
"use strict";

const { execute } = require("../../job-utils");

execute(async ({ auth }) => {

    let jwt = await auth.buildJWT("kairos", {
        sub: "kairos",
        iat: Math.floor(Date.now() / 1000),
    });

    return {
        token: `Bearer ${jwt.access_token}`,
    };
});
