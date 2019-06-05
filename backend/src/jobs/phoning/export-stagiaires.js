#!/usr/bin/env node
'use strict';

const moment = require('moment');
const fs = require('fs');
const { encodeStream } = require('iconv-lite');
const path = require('path');

module.exports = (logger, db, configuration, mailer, codeRegion) => {
    return new Promise((resolve, reject) => {
        let { avisRelaunchDelay } = configuration.smtp.stagiaires;

        logger.info('Generating CSV file...');

        let total = 0;
        let output = fs.createWriteStream(path.join(__dirname, `../../../../.data/stagiaires-phoning.csv`));

        output.write(`Nom;Prénom;Numéro de téléphone;Formation;Date de sortie;Lien\n`);

        db.collection('trainee').find({
            mailSent: true,
            unsubscribe: false,
            avisCreated: false,
            codeRegion: codeRegion,
            $and: [
                { mailSentDate: { $lte: moment().subtract(avisRelaunchDelay, 'days').toDate() } },
                { mailSentDate: { $gte: moment().subtract(6, 'months').toDate() } },
            ]
        }).transformStream({
            transform: stagiaire => {
                const link = mailer(db, logger, configuration).getFormLink(stagiaire);
                return `"${stagiaire.trainee.name}";"${stagiaire.trainee.firstName}";"${stagiaire.trainee.phoneNumbers[0]}";"${stagiaire.training.title}";"${moment(stagiaire.training.scheduledEndDate).format('DD/MM/YYYY')}";"${link}"\n`;
            }
        })
        .on('data', () => total++)
        .pipe(encodeStream('UTF-16BE'))
        .pipe(output)
        .on('error', e => reject(e))
        .on('finish', async () => {
            logger.info(`Results: ${total} stagiaires exported`);
            resolve();
        });

    });
};
