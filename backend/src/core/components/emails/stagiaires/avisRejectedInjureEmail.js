const BadDataError = require('./../../../errors');
const moment = require('moment');

module.exports = (db, regions, mailer) => {

    const templateName = 'avisRejectedInjureEmail';

    let render = stagiaire => {
        return mailer.render(__dirname, templateName, {
            stagiaire,
        });
    };

    return {
        templateName,
        render,
        send: async stagiaire => {
            if (!stagiaire.individu || !stagiaire.individu.email) {
                throw new BadDataError(`Le courriel de l'individu a été supprimé pour raison de RGPD. `);
            }

            let region = regions.findRegionByCodeRegion(stagiaire.codeRegion);

            return mailer.createRegionalMailerV2(region).sendEmail(
                stagiaire.individu.email,
                {
                    codeMessage: 'ANOTEA_STAGIAIRE_REJET_AVIS_INJURE',
                    stagiaireToken: stagiaire.token,
                    campaign: stagiaire.campaign ? stagiaire.campaign : 'unknown',
                    formationIntitule: stagiaire.formation.intitule,
                    formationDebut: moment(stagiaire.formation.action.session.periode.debut).format('DD/MM/YYYY'),
                    formationFin: moment(stagiaire.formation.action.session.periode.fin).format('DD/MM/YYYY'),
                    organismeFormateurRaisonSociale: stagiaire.formation.action.organisme_formateur.raison_sociale,
                }
            );
        },
    };
};
