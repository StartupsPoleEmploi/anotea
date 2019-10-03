const cli = require('commander');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { execute } = require('../job-utils');
const { pipeline, transformObjectIntoCSV } = require('../../common/utils/stream-utils');

cli
.option('--reconciliable')
.option('--output [output]')
.parse(process.argv);

execute(async ({ logger, db, regions }) => {

    const generateCSV = ({ nom, codeRegion }) => {

        let fileName = `reconciliation-${nom}-${codeRegion}.csv`;
        let csvFile = cli.output ? path.join(cli.output, fileName) : path.join(__dirname, '../../../../.data', fileName);

        logger.info(`Generating CSV file ${csvFile}...`);

        return pipeline([
            db.collection('comment').find({
                codeRegion,
                'meta.reconciliations.0.reconciliable': cli.reconciliable
            }),
            transformObjectIntoCSV({
                'id': avis => avis._id,
                'note accueil': avis => avis.rates ? avis.rates.accueil : '',
                'note contenu formation': avis => avis.rates ? avis.rates.contenu_formation : '',
                'note equipe formateurs': avis => avis.rates ? avis.rates.equipe_formateurs : '',
                'note matériel': avis => avis.rates ? avis.rates.moyen_materiel : '',
                'note accompagnement': avis => avis.rates ? avis.rates.accompagnement : '',
                'note global': avis => avis.rates ? avis.rates.global : '',
                'pseudo': avis => (avis.comment && avis.comment.pseudo) ? avis.comment.pseudo : '',
                'titre': avis => (avis.comment && avis.comment.title) ? avis.comment.title : '',
                'commentaire': avis => (avis.comment && avis.comment.text) ? avis.comment.text : '',
                'campagne': avis => avis.campaign,
                'date': avis => avis.date,
                'accord': avis => avis.accord,
                'id formation': avis => avis.training.idFormation,
                'titre formation': avis => avis.training.title,
                'date début': avis => moment(avis.training.startDate).format('DD/MM/YYYY'),
                'date de fin prévue': avis => moment(avis.training.scheduledEndDate).format('DD/MM/YYYY'),
                'id organisme': avis => `="${avis.training.organisation.id}"`,
                ' siret organisme': avis => `="${avis.training.organisation.siret}"`,
                'libellé organisme': avis => avis.training.organisation.label,
                'nom organisme': avis => avis.training.organisation.name,
                'code postal': avis => avis.training.place.postalCode,
                'ville': avis => avis.training.place.city,
                'id certif info': avis => (`="${avis.training.certifInfo.id}"`),
                'libellé certifInfo': avis => avis.training.certifInfo.label,
                'id session': avis => avis.training.idSession,
                'formacode': avis => avis.training.formacode,
                'id session aude formation': avis => avis.training.idSessionAudeFormation,
                'numéro d\'action': avis => avis.infoCarif ? avis.infoCarif.numeroAction : '',
                'numéro de session': avis => avis.infoCarif ? avis.infoCarif.numeroSession : '',
                'code financeur': avis => avis.training.codeFinanceur,
            }),
            fs.createWriteStream(csvFile)
        ]);
    };

    return Promise.all(regions.findActiveRegions().map(region => generateCSV(region)));
});
