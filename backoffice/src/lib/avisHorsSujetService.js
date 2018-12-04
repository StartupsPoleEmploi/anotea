import { _put} from '../utils/http-client';

export const sendMailToAvisHorsSujetOwner = (id) => {
    return _put(`/backoffice/sendMailToAvisHorsSujetOwner`, {
        id: id
    });
};
