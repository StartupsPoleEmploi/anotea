import { _get } from "../../common/utils/http-client";

export const getLatestStatistics = () => {
    return _get(`/stats/latest`);
};

