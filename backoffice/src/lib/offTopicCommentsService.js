import { _put} from '../utils/http-client';

export const sendMailToOffTopicCommentOwner = (id) => {
    return _put(`/backoffice/sendMailToOffTopicCommentOwner`, {
        id: id
    });
};
