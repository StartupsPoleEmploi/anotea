import { _get } from '../../utils/http-client';

export const getAvis = () => {
    return _get(`/public-stats/avis`);
};
