import { _get } from '../utils/http-client';

export const getSirens = () => {
    return _get(`/backoffice/organismes`);
};
