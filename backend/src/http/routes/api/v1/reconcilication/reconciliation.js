const findDocumentsAsStream = require('./findDocumentsAsStream');
const getDocument = require('./getDocument');
const getAvis = require('./getAvis');

module.exports = db => {
    return {
        findFormationsAsStream: findDocumentsAsStream(db, 'formation'),
        findActionsAsStream: findDocumentsAsStream(db, 'action'),
        findSessionsAsStream: findDocumentsAsStream(db, 'session'),
        getFormation: getDocument(db, 'formation'),
        getAction: getDocument(db, 'action'),
        getSession: getDocument(db, 'session'),
        getAvisForFormation: getAvis(db, 'formation'),
        getAvisForAction: getAvis(db, 'action'),
        getAvisForSession: getAvis(db, 'session'),
    };
};
