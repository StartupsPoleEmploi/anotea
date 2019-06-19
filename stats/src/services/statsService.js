import { _get } from './http-client';

export const getOrganismes = () => {
    return _get(`/public-stats/organismes`);
};

export const getAvis = () => {
    return _get(`/public-stats/avis`);
};
