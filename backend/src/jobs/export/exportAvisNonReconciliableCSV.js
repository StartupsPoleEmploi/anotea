const fs = require('fs');
const cli = require('commander');
const { encodeStream } = require('iconv-lite');
const path = require('path');
const moment = require('moment');
const { execute } = require('../job-utils');
const { transformObject } = require('../../common/utils/stream-utils');

cli.description('Export organismes per active region')
.parse(process.argv);

execute(async ({ logger, db, regions }) => {

    const generateCSV = ({ nom, codeRegion }) => {
        return new Promise((resolve, reject) => {
            let total = 0;
            let output = fs.createWriteStream(path.join(__dirname, `../../../../.data/avis-non-reconciliables-${nom}-${codeRegion}.xls`));

            output.write('id;note accueil;note contenu formation;note equipe formateurs;note matériel;note accompagnement;note global;pseudo;titre;commentaire;campagne;date;accord;id formation; titre formation;date début;date de fin prévue;id organisme; siret organisme;libellé organisme;nom organisme;code postal;ville;id certif info;libellé certifInfo;id session;formacode;AES reçu;référencement;id session aude formation;numéro d\'action;numéro de session;code financeur\n');

            db.collection('comment').find({ codeRegion })
            .pipe(transformObject(async avis => {
                let [sessions, actions, formations] = await Promise.all([
                    db.collection('sessionsReconciliees').countDocuments({ 'avis._id': avis._id }),
                    db.collection('actionsReconciliees').countDocuments({ 'avis._id': avis._id }),
                    db.collection('formationsReconciliees').countDocuments({ 'avis._id': avis._id }),
                ]);
                return sessions + actions + formations === 0 ? avis : {};
            }))
            .pipe(transformObject(async avis => {

                return avis._id + ';' +
                    (avis.rates ? avis.rates.accueil : '') + ';' +
                    (avis.rates ? avis.rates.contenu_formation : '') + ';' +
                    (avis.rates ? avis.rates.equipe_formateurs : '') + ';' +
                    (avis.rates ? avis.rates.moyen_materiel : '') + ';' +
                    (avis.rates ? avis.rates.accompagnement : '') + ';' +
                    (avis.rates ? avis.rates.global : '') + ';' +
                    ((avis.comment && avis.comment.pseudo) ? `${avis.comment.pseudo};` : ' ;') +
                    ((avis.comment && avis.comment.title) ? `${avis.comment.title};` : ' ;') +
                    ((avis.comment && avis.comment.titre) ? `${avis.comment.titre};` : ' ;') +
                    avis.campaign + ';' +
                    avis.date + ';' +
                    avis.accord + ';' +
                    avis.training.idFormation + ';' +
                    avis.training.title + ';' +
                    moment(avis.training.startDate).format('DD/MM/YYYY') + ';' +
                    moment(avis.training.scheduledEndDate).format('DD/MM/YYYY') + ';' +
                    `="${avis.training.organisation.id}";` +
                    `="${avis.training.organisation.siret}";` +
                    avis.training.organisation.label + ';' +
                    avis.training.organisation.name + ';' +
                    avis.training.place.postalCode + ';' +
                    avis.training.place.city + ';' +
                    `="${avis.training.certifInfo.id}";` +
                    avis.training.certifInfo.label + ';' +
                    avis.training.idSession + ';' +
                    avis.training.formacode + ';' +
                    avis.training.aesRecu + ';' +
                    avis.training.referencement + ';' +
                    avis.training.idSessionAudeFormation + ';' +
                    (avis.infoCarif ? avis.infoCarif.numeroAction : '') + ';' +
                    (avis.infoCarif ? avis.infoCarif.numeroSession : '') + ';' +
                    avis.training.codeFinanceur + '\n';

            }, { ignoreEmpty: true }))
            .on('data', () => total++)
            .pipe(encodeStream('UTF-16BE'))
            .pipe(output)
            .on('error', e => reject(e))
            .on('finish', async () => {
                logger.info(`Results: ${total} avis for region ${codeRegion}`);
                resolve();
            });
        });
    };

    //Building indexes only for this script
    await Promise.all([
        db.collection('sessionsReconciliees').createIndex({ 'avis._id': 1 }),
        db.collection('actionsReconciliees').createIndex({ 'avis._id': 1 }),
        db.collection('formationsReconciliees').createIndex({ 'avis._id': 1 }),
    ]);

    logger.info(`Generating CSV file...`);
    await Promise.all(regions.findActiveRegions().map(region => generateCSV(region)));
});
