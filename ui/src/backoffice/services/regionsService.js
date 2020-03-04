import { _get } from '../../common/utils/http-client';

export const getRegions = () => {
    return _get(`/regions`);
};
