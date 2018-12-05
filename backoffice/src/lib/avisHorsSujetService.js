import { _put} from '../utils/http-client';

export const sendAvisHorsSujetEmail = (id) => {
    return _put(`/backoffice/sendAvisHorsSujetEmail`, {
        id: id
    });
};
