import { _get, _post } from '../../utils/http-client';

export const login = (identifiant, password) => _post('/backoffice/login', { identifiant, password });

export const loginWithAccessToken = (accessToken, origin) => {
    return _get(`/backoffice/login?origin=${origin}&access_token=${accessToken}`);
};
