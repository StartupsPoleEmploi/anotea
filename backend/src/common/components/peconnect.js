const uuid = require('uuid');

const API_ROOT = 'https://authentification-candidat.pole-emploi.fr';

const CALLBACK_URL = 'http://127.0.0.1:8080/callback_pe_connect';

const getState = () => uuid.v4().toString('base64');

const getNonce = () => uuid.v4().toString('base64');

const buildConnectionLink = (state, nonce) => `${API_ROOT}/connexion/oauth2/authorize?realm=%2Findividu&response_type=code&client_id=${process.env.ANOTEA_PECONNECT_CLIENT_ID}&scope=application_${process.env.ANOTEA_PECONNECT_CLIENT_ID}%20api_peconnect-individuv1%20openid%20profile%20email&redirect_uri=${CALLBACK_URL}&state=${state}&nonce=${nonce}`;

const initConnection = () => {
    const state = getState();
    const nonce = getNonce();

    return {
        state,
        nonce,
        link: buildConnectionLink(state, nonce)
    };
};

const checkState = (realState, state) => realState === state;

module.exports = {
    initConnection,
    checkState
};
