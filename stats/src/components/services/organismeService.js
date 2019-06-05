import { _get } from '../../utils/http-client';

export const getOrganismes = () => {
    return _get(`/public-stats/organismes`);
};
