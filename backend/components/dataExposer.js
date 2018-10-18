const s = require('string');

module.exports = function() {

    const unescapeComments = function(advices) {
        return advices.map(advice => {
            if (advice.comment) {
                if (advice.comment.pseudo) {
                    advice.comment.pseudo = s(advice.comment.pseudo).unescapeHTML().s;
                }
                advice.comment.title = s(advice.comment.title).unescapeHTML().s;
                advice.comment.text = s(advice.comment.text).unescapeHTML().s;
            }
            return advice;
        });
    };

    const buildAdviceLBF = function(comment) {
        let adviceObj = { id: comment._id };
        adviceObj.date = comment.date;
        adviceObj.training_title = comment.training.title;
        adviceObj.id_of = comment.training.organisation.id;
        adviceObj.id_formation = comment.training.idFormation;
        adviceObj.formacode = comment.training.formacode;
        adviceObj.startDate = comment.training.startDate;
        adviceObj.scheduledEndDate = comment.training.scheduledEndDate;
        adviceObj.notes = comment.rates;
        adviceObj.reponseOF = comment.answer;
        if (comment.pseudo && comment.pseudoMasked !== true) {
            adviceObj.pseudonyme = comment.pseudo;
        } else {
            adviceObj.pseudonyme = null;
        }
        if (comment.comment) {
            adviceObj.commentaire = {
                titre: !comment.titleMasked ? comment.comment.title : null,
                contenu: comment.editedComment !== undefined ? comment.editedComment.text : comment.comment.text
            };
        } else {
            adviceObj.commentaire = null;
        }

        return adviceObj;
    };

    const buildProjectedAdviceLBF = function(comment) {
        let adviceObj = { id: comment.idAdvice };
        adviceObj.date = comment.date;
        adviceObj.training_title = comment.trainingTitle;
        adviceObj.id_of = comment.id_of;
        adviceObj.id_formation = comment.id_formation;
        adviceObj.formacode = comment.formacode;
        adviceObj.startDate = comment.startDate;
        adviceObj.scheduledEndDate = comment.scheduledEndDate;
        adviceObj.notes = comment.rates;
        adviceObj.reponseOF = comment.answer;
        if (comment.pseudo && comment.pseudoMasked !== true) {
            adviceObj.pseudonyme = comment.pseudo;
        } else {
            adviceObj.pseudonyme = null;
        }
        if (comment.comment) {
            adviceObj.commentaire = {
                titre: !comment.titleMasked ? comment.comment.title : null,
                contenu: comment.editedComment !== undefined ? comment.editedComment.text : comment.comment.text
            };
        } else {
            adviceObj.commentaire = null;
        }

        return adviceObj;
    };

    const buildAdvice = function(comment) {
        let adviceObj = { id: comment._id };
        adviceObj.notes = comment.rates;
        adviceObj.date = comment.date;
        adviceObj.id_of = comment.id_of;
        adviceObj.id_formation = comment.id_formation;
        adviceObj.formacode = comment.formacode;
        adviceObj.dateDebutFormation = comment.startDate;
        adviceObj.dateFinFormation = comment.scheduledEndDate;
        adviceObj.reponseOF = comment.answer ? comment.answer : null;
        adviceObj.pseudonyme = comment.pseudo ? comment.pseudo : null;
        if (comment.comment !== undefined && comment.comment !== null) {
            adviceObj.commentaire = {
                titre: comment.comment.title,
                contenu: comment.editedComment !== undefined ? comment.editedComment.text : comment.comment.text
            };
        } else {
            adviceObj.commentaire = null;
        }

        return adviceObj;
    };

    const buildCommentsStats = function(doc) {
        doc.comments = 0;
        for (let idx in doc.commentsArray) {
            if (doc.commentsArray[idx] !== null && (doc.commentsArray[idx].title !== '' || doc.commentsArray[idx].text !== '')) {
                doc.comments++;
            }
        }
        doc.commentsRejected = doc.commentsRejectedArray.length;
        delete doc.commentsArray;
        delete doc.commentsRejectedArray;
        return doc;
    };

    return {
        buildAdviceLBF: buildAdviceLBF,
        buildProjectedAdviceLBF: buildProjectedAdviceLBF,
        buildAdvice: buildAdvice,
        buildCommentsStats: buildCommentsStats,
        unescapeComments: unescapeComments
    };
};
