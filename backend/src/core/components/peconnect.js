const { BadDataError } = require('../errors');
const { Issuer, generators, custom } = require('openid-client');

module.exports = (db, configuration) => {

    let clientId = configuration.peconnect.client_id;
    let issuerUrl = configuration.peconnect.issuer_url;
    let endpoint = configuration.peconnect.endpoint;
    let callbackUrl = configuration.peconnect.callback_url;

    let issuer = new Issuer({
        issuer: issuerUrl,
        jwks_uri: `${endpoint}/connect/jwk_uri`,
        authorization_endpoint: `${endpoint}/authorize`,
        token_endpoint: `${endpoint}/access_token?realm=/individu`,
        token_endpoint_auth_methods_supported: 'client_secret_post',
        userinfo_endpoint: configuration.peconnect.api_url,
    });

    let client = new issuer.Client({
        client_id: clientId,
        client_secret: configuration.peconnect.client_secret,
        redirect_uris: [callbackUrl],
        response_types: ['code'],
    });

    custom.setHttpOptionsDefaults({
        timeout: configuration.peconnect.timeout,
    });

    return {
        getAuthenticationUrl: async () => {

            let nonce = generators.nonce();
            let state = generators.state();

            await db.collection('peConnectTokens').insertOne({
                nonce,
                state,
                creationDate: new Date(),
            });

            return client.authorizationUrl({
                scope: `api_peconnect-individuv1 openid email application_${clientId}`,
                realm: '/individu',
                state,
                nonce,
            });
        },
        getUserInfo: async url => {
            let params = client.callbackParams(url);

            let auth = await db.collection('peConnectTokens').findOne({ state: params.state });
            if (!auth) {
                throw new BadDataError('Unable to find PE connect token');
            }

            let tokenSet;
            try {
                tokenSet = await client.callback(callbackUrl, params, { state: auth.state, nonce: auth.nonce });
            } catch (e) {
                console.error('getUserInfo', e);
                throw e;
            }

            return await client.userinfo(tokenSet.access_token);
        },
    };
};
