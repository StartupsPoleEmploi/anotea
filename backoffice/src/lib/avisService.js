import { _get, _post, _delete, _put } from '../utils/http-client';

export const searchAvis = (options = {}) => {
    let filter = options.filter || 'all';
    let query = options.query || '';
    let page = options.page ? options.page - 1 : 0;

    return _get(`/backoffice/avis?filter=${filter}&page=${page}&query=${query}`);
};

export const maskPseudo = id => {
    return _put(`/backoffice/avis/${id}/maskPseudo`);
};

export const unmaskPseudo = id => {
    return _put(`/backoffice/avis/${id}/unmaskPseudo`);
};

export const maskTitle = id => {
    return _put(`/backoffice/avis/${id}/maskTitle`);
};

export const unmaskTitle = id => {
    return _put(`/backoffice/avis/${id}/unmaskTitle`);
};

export const rejectAvis = (id, reason) => {
    return _post(`/backoffice/avis/${id}/reject`, {
        reason: reason
    });
};

export const markAvisAsRead = (id, userId) => {
    return _put(`/backoffice/avis/${id}/markAsRead?userID=${userId}`);
};

export const markAvisAsNotRead = (id, userId) => {
    return _put(`/backoffice/avis/${id}/markAsNotRead?userID=${userId}`);
};

export const reportAvis = (id, userId) => {
    return _put(`/backoffice/avis/${id}/report?userID=${userId}`);
};

export const unreportAvis = (id, userId) => {
    return _put(`/backoffice/avis/${id}/unreport?userID=${userId}`);
};

export const publishAvis = (id, qualification) => {
    return _post(`/backoffice/avis/${id}/publish`, {
        qualification: qualification
    });
};

export const answerAvis = (id, answer) => {
    return _post(`/backoffice/avis/${id}/answer`, {
        answer: answer
    });
};

export const removeAvisAnswer = id => {
    return _delete(`/backoffice/avis/${id}/answer`);
};

export const editAvis = (id, text) => {
    return _put(`/backoffice/avis/${id}/edit`, {
        text,
    });
};

export const resendEmail = id => {
    return _put(`/backoffice/avis/${id}/resendEmail`);
};

export const deleteAvis = id => {
    return _delete(`/backoffice/avis/${id}`);
};
