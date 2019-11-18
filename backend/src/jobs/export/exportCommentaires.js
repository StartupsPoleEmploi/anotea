const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { execute } = require('../job-utils');
const { ignoreEmpty, pipeline, transformObjectIntoCSV, encodeIntoUTF8 } = require('../../common/utils/stream-utils');

let sanitizeNote = note => `${note}`.replace(/\./g, ',');
let sanitizeString = note => `${note}`.replace(/;/g, '').replace(/"/g, '').replace(/\r/g, ' ').replace(/\n/g, ' ').trim();

execute(async ({ logger, db }) => {

    logger.info(`Generating CSV file...`);
    let csvFile = path.join(__dirname, '../../../../.data', `commentaires.csv`);

    logger.info(`Generating CSV file ${csvFile}...`);
    return pipeline([
        db.collection('comment').find({ status: 'validated', comment: { $exists: true } }),
        transformObjectIntoCSV({
            'date': comment => moment(comment.date).format(),
            'note_accueil': comment => sanitizeNote(comment.rates.accueil),
            'note_contenu': comment => sanitizeNote(comment.rates.contenu_formation),
            'note_formateur': comment => sanitizeNote(comment.rates.equipe_formateurs),
            'note_materiels': comment => sanitizeNote(comment.rates.moyen_materiel),
            'note_accompagnement': comment => sanitizeNote(comment.rates.accompagnement),
            'note_globale': comment => sanitizeNote(comment.rates.global),
            'commentaire': comment => sanitizeString(_.get(comment, 'comment.text', '')),
            'qualification': comment => _.isEmpty(comment.qualification) ? '' : comment.qualification,
        }),
        encodeIntoUTF8(),
        fs.createWriteStream(csvFile)
    ]);
});
