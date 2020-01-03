import { _get } from "../../common/utils/http-client";

export const getSirens = () => {
    return _get(`/backoffice/sirens`);
};
