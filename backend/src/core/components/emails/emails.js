const avisNotificationEmail = require("./organismes/avisNotificationEmail");
const forgottenPasswordEmail = require("./accounts/forgottenPasswordEmail");
const activationCompteEmail = require("./organismes/activationCompteEmail");
const avisStagiaireEmail = require("./stagiaires/avisStagiaireEmail");
const reponseRejectedEmail = require("./organismes/reponseRejectedEmail");
const avisReportedCanceledEmail = require("./organismes/avisReportedCanceledEmail");
const avisReportedConfirmedEmail = require("./organismes/avisReportedConfirmedEmail");
const avisRejectedInjureEmail = require("./stagiaires/avisRejectedInjureEmail");
const avisRejectedAlerteEmail = require("./stagiaires/avisRejectedAlerteEmail");
const questionnaire6MoisEmail = require("./stagiaires/questionnaire6MoisEmail");
const questionnaireOrganismeEmail = require("./organismes/questionnaireOrganismeEmail");

module.exports = (db, configuration, regions, mailer) => {

    let emails = [
        //Accounts
        forgottenPasswordEmail(db, regions, mailer),

        //Organismes
        activationCompteEmail(db, regions, mailer),
        avisNotificationEmail(db, regions, mailer),
        avisReportedCanceledEmail(db, regions, mailer),
        avisReportedConfirmedEmail(db, regions, mailer),
        questionnaireOrganismeEmail(db, regions, mailer),
        reponseRejectedEmail(db, regions, mailer),

        //Stagiaires
        avisStagiaireEmail(db, regions, mailer),
        avisRejectedInjureEmail(db, regions, mailer),
        avisRejectedAlerteEmail(db, regions, mailer),
        questionnaire6MoisEmail(db, regions, mailer),
    ];

    return {
        getEmailMessageByTemplateName: name => {
            return emails.find(email => email.templateName === name);
        }
    };
};
