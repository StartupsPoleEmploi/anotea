import { _get } from '../utils/http-client';

export const sendMailToOffTopicCommentOwner = (id) => {
    return _get(`/backoffice/sendMailToOffTopicCommentOwner/${id}`);
};
