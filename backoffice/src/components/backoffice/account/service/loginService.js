import { _post, _get } from '../../../../utils/http-client';

export const login = credentials => _post('/backoffice/login', credentials);

export const loginWithAccessToken = (accessToken, origin) => {
    return _get(`/backoffice/login?origin=${origin}&access_token=${accessToken}`);
};
