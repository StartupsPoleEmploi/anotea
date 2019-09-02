const uuid = require('uuid');
const request = require('request');

const API_LOGIN_ROOT = 'https://authentification-candidat.pole-emploi.fr';

const API_ROOT = 'https://api.emploi-store.fr/partenaire';

const getState = () => uuid.v4().toString('base64');

const getNonce = () => uuid.v4().toString('base64');

const buildConnectionLink = (configuration, state, nonce) => `${API_LOGIN_ROOT}/connexion/oauth2/authorize?realm=%2Findividu&response_type=code&client_id=${configuration.peconnect.client_id}&scope=application_${configuration.peconnect.client_id}%20api_peconnect-individuv1%20openid%20profile%20email&redirect_uri=${configuration.peconnect.callback_url}&state=${state}&nonce=${nonce}`;

const checkState = (realState, state) => realState === state;

module.exports = configuration => {
    return {
        initConnection: () => {
            const state = getState();
            const nonce = getNonce();

            return {
                state,
                nonce,
                link: buildConnectionLink(configuration, state, nonce)
            };
        },
        checkState: (realState, state) => realState === state,
        buildAccessToken: (configuration, code, nonce) => {
            return new Promise((resolve, reject) => {
                const data = {
                    grant_type: 'authorization_code',
                    code,
                    client_id: configuration.peconnect.client_id,
                    client_secret: configuration.peconnect.client_secret,
                    redirect_uri: CALLBACK_URL
                };
                request.post({ url: `${API_LOGIN_ROOT}/connexion/oauth2/access_token?realm=%2Findividu`, form: data }, (error, response, body) => {
                    let json = JSON.parse(body);
                    if (json.error) {
                        reject({ error: json.error });
                    } else if (json.nonce !== nonce) {
                        reject({ error: 'nonce' });
                    } else {
                        resolve(json);
                    }
                });
            });
        },
        getUserInfo: accessToken => {
            return new Promise((resolve, reject) => {
                const auth = `Bearer ${accessToken}`;
                request.get({ url: `${API_ROOT}/peconnect-individu/v1/userinfo`, headers: { Authorization: auth } }, (error, response, body) => {
                    let json = JSON.parse(body);
                    if (json.error) {
                        reject({ error: json.error });
                    } else {
                        resolve(json);
                    }
                });
            });
        }
    }
};
