module.exports = function(db, logger, configuration, devMode, callback) {

    logger.info('Advices export : launch');

    const moment = require('moment');
    const fs = require('fs');
    const path = require('path');
    const S = require('string');
    const filenames = [];

    const launchTime = new Date();

    const completed = (count, regionsCount) => {
        logger.info(`Advices export - completed (${count} exported, ${regionsCount} regions, ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
    };

    const prepareFiles = regions => {
        let dir = path.join(configuration.exports.path, 'regions');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        return regions.forEach(region => {
            filenames[region.region_num] = path.join(dir, `avis-${region.region_num}.csv`);
            fs.writeFileSync(filenames[region.region_num], 'id;note accueil;note contenu formation;note equipe formateurs;note matériel;note accompagnement;note global;pseudo;titre;commentaire;campagne;etape;date;accord;id formation; titre formation;date début;date de fin prévue;id organisme; siret organisme;libellé organisme;nom organisme;code postal;ville;id certif info;libellé certifInfo;id session;formacode;AES reçu;référencement;id session aude formation;numéro d\'action;numéro de session;code financeur\n', 'utf8');
        });
    };

    const doExport = () => {
        let stream = db.collection('comment').find({
            'step': { $gte: 2 },
            'training.infoRegion': { $ne: null }
        }, { token: 0 }).stream();
        let count = 0;
        let regions = configuration.app.active_regions.map(e => e.code_region);

        stream.on('data', function(advice) {
            count++;

            if (advice.comment != undefined) {
                advice.comment.pseudo = (advice.comment.pseudo != undefined) ? advice.comment.pseudo.replace(/\r?\n|\r/g, ' ') : '';
                advice.comment.title = (advice.comment.title != undefined) ? advice.comment.title.replace(/\r?\n|\r/g, ' ') : '';
                advice.comment.text = (advice.comment.text != undefined) ? advice.comment.text.replace(/\r?\n|\r/g, ' ') : '';
            }

            let line = advice._id + ';' +
                (advice.rates != undefined ? advice.rates.accueil : '') + ';' +
                (advice.rates != undefined ? advice.rates.contenu_formation : '') + ';' +
                (advice.rates != undefined ? advice.rates.equipe_formateurs : '') + ';' +
                (advice.rates != undefined ? advice.rates.moyen_materiel : '') + ';' +
                (advice.rates != undefined ? advice.rates.accompagnement : '') + ';' +
                (advice.rates != undefined ? advice.rates.global : '') + ';' +
                (advice.comment != undefined ? S(advice.comment.pseudo).unescapeHTML().replaceAll(';', '').replaceAll('"', '').s : '') + ';' +
                (advice.comment != undefined ? S(advice.comment.title).unescapeHTML().replaceAll(';', '').replaceAll('"', '').s : '') + ';' +
                (advice.comment != undefined ? S(advice.comment.text).unescapeHTML().replaceAll(';', '').replaceAll('"', '').s : '') + ';' +
                advice.campaign + ';' +
                advice.step + ';' +
                advice.date + ';' +
                advice.accord + ';' +
                advice.training.idFormation + ';' +
                advice.training.title + ';' +
                moment(advice.training.startDate).format('DD/MM/YYYY') + ';' +
                moment(advice.training.scheduledEndDate).format('DD/MM/YYYY') + ';' +
                advice.training.organisation.id + ';' +
                '"' + advice.training.organisation.siret + '";' +
                advice.training.organisation.label + ';' +
                advice.training.organisation.name + ';' +
                advice.training.place.postalCode + ';' +
                advice.training.place.city + ';' +
                '\'' + advice.training.certifInfo.id + '\';' +
                advice.training.certifInfo.label + ';' +
                advice.training.idSession + ';' +
                advice.training.formacode + ';' +
                advice.training.aesRecu + ';' +
                advice.training.referencement + ';' +
                advice.training.idSessionAudeFormation + ';' +
                (advice.infoCarif != undefined ? advice.infoCarif.numeroAction : '') + ';' +
                (advice.infoCarif != undefined ? advice.infoCarif.numeroSession : '') + ';' +
                advice.training.codeFinanceur;
            fs.appendFileSync(filenames[advice.codeRegion], `${line}\n`, 'utf8');
        });

        stream.on('end', function() {
            completed(count, regions.length);
            if (callback) {
                callback();
            }
        });
    };

    db.collection('departements').find({ region_num: { $in: regions } }).toArray(async (err, regions) => {
        if (err) {
            logger.error(err);
        } else if (regions.length > 0) {
            await prepareFiles(regions);
            doExport();
        } else {
            completed(0, 0);
        }
    });
};
