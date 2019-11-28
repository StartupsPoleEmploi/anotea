const avisNotificationEmail = require('./organismes/avisNotificationEmail');
const forgottenPasswordEmail = require('./accounts/forgottenPasswordEmail');
const activationCompteEmail = require('./organismes/activationCompteEmail');
const avisStagiaireEmail = require('./stagiaires/avisStagiaireEmail');
const reponseRejectedEmail = require('./organismes/reponseRejectedEmail');
const avisReportedCanceledEmail = require('./organismes/avisReportedCanceledEmail');
const avisReportedConfirmedEmail = require('./organismes/avisReportedConfirmedEmail');
const avisRejectedInjureEmail = require('./stagiaires/avisRejectedInjureEmail');
const avisRejectedAlerteEmail = require('./stagiaires/avisRejectedAlerteEmail');
const questionnaire6MoisEmail = require('./stagiaires/questionnaire6MoisEmail');
const questionnaireOrganismeEmail = require('./organismes/questionnaireOrganismeEmail');
const createTemplateUtils = require('./createTemplateUtils');

module.exports = (db, configuration, regions, mailer) => {

    let utils = createTemplateUtils(configuration, regions);

    let emails = [
        //Accounts
        forgottenPasswordEmail(db, regions, mailer, utils),

        //Organismes
        activationCompteEmail(db, regions, mailer, utils),
        avisNotificationEmail(db, regions, mailer, utils),
        avisReportedCanceledEmail(db, regions, mailer, utils),
        avisReportedConfirmedEmail(db, regions, mailer, utils),
        questionnaireOrganismeEmail(db, regions, mailer, utils),
        reponseRejectedEmail(db, regions, mailer, utils),

        //Stagiaires
        avisStagiaireEmail(db, regions, mailer, utils),
        avisRejectedInjureEmail(db, regions, mailer, utils),
        avisRejectedAlerteEmail(db, regions, mailer, utils),
        questionnaire6MoisEmail(db, regions, mailer, utils),
    ];

    return {
        getEmailMessageByTemplateName: name => {
            return emails.find(email => email.templateName === name);
        }
    };
};
