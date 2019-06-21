import { _get } from './http-client';

export const getLatestStatistics = () => {
    return _get(`/stats/latest`);
};

