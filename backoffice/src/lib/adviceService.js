import { _get, _post, _delete, _put } from '../utils/http-client';

export const loadAdvices = (filter, order, codeRegion, page) => {
    let query = '';
    if (filter) {
        query = `?filter=${filter}&order=${order}`;
    }
    if (page != null) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}page=${page}`;
    }
    return _get(`/backoffice/advices/${codeRegion}/${query}`);
};

export const loadInventory = codeRegion => {
    return _get(`/backoffice/advices/${codeRegion}/inventory`);
};

export const maskPseudo = id => {
    return _put(`/backoffice/advice/${id}/maskPseudo`);
};

export const unmaskPseudo = id => {
    return _put(`/backoffice/advice/${id}/unmaskPseudo`);
};

export const maskTitle = id => {
    return _put(`/backoffice/advice/${id}/maskTitle`);
};

export const unmaskTitle = id => {
    return _put(`/backoffice/advice/${id}/unmaskTitle`);
};

export const rejectAdvice = (id, reason) => {
    return _post(`/backoffice/advice/${id}/reject`, {
        reason: reason
    });
};

export const markAdviceAsRead = (id, userId) => {
    return _put(`/backoffice/advice/${id}/markAsRead?userID=${userId}`);
};

export const markAdviceAsNotRead = (id, userId) => {
    return _put(`/backoffice/advice/${id}/markAsNotRead?userID=${userId}`);
};

export const reportAdvice = (id, userId) => {
    return _put(`/backoffice/advice/${id}/report?userID=${userId}`);
};

export const unreportAdvice = (id, userId) => {
    return _put(`/backoffice/advice/${id}/unreport?userID=${userId}`);
};

export const publishAdvice = (id, qualification) => {
    return _post(`/backoffice/advice/${id}/publish`, {
        qualification: qualification
    });
};

export const answerAdvice = (id, answer) => {
    return _post(`/backoffice/advice/${id}/answer`, {
        answer: answer
    });
};

export const removeAdviceAnswer = id => {
    return _delete(`/backoffice/advice/${id}/answer`);
};

export const updateAdvice = (id, text, qualification) => {
    return _post(`/backoffice/advice/${id}/update`, {
        text,
        qualification
    });
};
