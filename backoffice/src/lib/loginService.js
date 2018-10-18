import { _post, _get } from '../utils/http-client';

export const login = credentials => _post('/backoffice/login', credentials);

export const loginWithAccessToken = accessToken => _get(`/backoffice/login?access_token=${accessToken}`);
