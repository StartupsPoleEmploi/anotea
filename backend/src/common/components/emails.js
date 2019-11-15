const nouveauxAvisNotificationEmail = require('./emails/nouveauxAvisNotificationEmail');
const forgottenPasswordEmail = require('./emails/forgottenPasswordEmail');
const accountActivationEmail = require('./emails/accountActivationEmail');
const avisStagiaireEmail = require('./emails/avisStagiaireEmail');
const reponseRejectedEmail = require('./emails/reponseRejectedEmail');
const avisReportedCanceledEmail = require('./emails/avisReportedCanceledEmail');
const avisReportedConfirmedEmail = require('./emails/avisReportedConfirmedEmail');
const avisRejectedInjureEmail = require('./emails/avisRejectedInjureEmail');
const avisRejectedAlerteEmail = require('./emails/avisRejectedAlerteEmail');
const questionnaire6MoisEmail = require('./emails/questionnaire6MoisEmail');
const questionnaireOrganismeEmail = require('./emails/questionnaireOrganismeEmail');

module.exports = (db, regions, mailer, templates) => {
    return {
        createAccountActivationEmail: accountActivationEmail(db, regions, mailer, templates),
        createAvisRejectedInjureEmail: avisRejectedInjureEmail(db, regions, mailer, templates),
        createAvisRejectedAlerteEmail: avisRejectedAlerteEmail(db, regions, mailer, templates),
        createAvisReportedCanceledEmail: avisReportedCanceledEmail(db, regions, mailer, templates),
        createAvisReportedConfirmedEmail: avisReportedConfirmedEmail(db, regions, mailer, templates),
        createAvisStagiaireEmail: avisStagiaireEmail(db, regions, mailer, templates),
        createForgottenPasswordEmail: forgottenPasswordEmail(db, regions, mailer, templates),
        createNouveauxAvisNotificationEmail: nouveauxAvisNotificationEmail(db, regions, mailer, templates),
        createReponseRejectedEmail: reponseRejectedEmail(db, regions, mailer, templates),
        createQuestionnaire6MoisEmail: questionnaire6MoisEmail(db, regions, mailer, templates),
        createQuestionnaireOrganismeEmail: questionnaireOrganismeEmail(db, regions, mailer, templates),
    };
};
