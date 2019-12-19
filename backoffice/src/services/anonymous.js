import { _get } from '../utils/http-client';

export const getRegionList = (options = {}) => {
    return _get(`/regions`);
};
