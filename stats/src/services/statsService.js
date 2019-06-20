import { _get } from './http-client';

export const getLatestStatistics = () => {
    return _get(`/public-stats/latest`);
};

