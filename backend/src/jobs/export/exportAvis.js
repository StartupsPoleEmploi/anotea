const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { execute } = require('../job-utils');
const { pipeline, transformObjectIntoCSV, encodeIntoUTF8 } = require('../../core/utils/stream-utils');

let sanitizeNote = note => `${note}`.replace(/\./g, ',');
let sanitizeString = note => `${note}`.replace(/;/g, '').replace(/"/g, '').replace(/\r/g, ' ').replace(/\n/g, ' ').trim();

execute(async ({ logger, db }) => {

    logger.info(`Generating CSV file...`);
    let csvFile = path.join(__dirname, '../../../../.data', `commentaires.csv`);

    logger.info(`Generating CSV file ${csvFile}...`);
    return pipeline([
        db.collection('avis').find({ status: 'validated', commentaire: { $exists: true } }),
        transformObjectIntoCSV({
            'date': avis => moment(avis.date).format(),
            'note_accueil': avis => sanitizeNote(avis.notes.accueil),
            'note_contenu': avis => sanitizeNote(avis.notes.contenu_formation),
            'note_formateur': avis => sanitizeNote(avis.notes.equipe_formateurs),
            'note_materiels': avis => sanitizeNote(avis.notes.moyen_materiel),
            'note_accompagnement': avis => sanitizeNote(avis.notes.accompagnement),
            'note_globale': avis => sanitizeNote(avis.notes.global),
            'commentaire': avis => sanitizeString(_.get(avis, 'commentaire.text', '')),
            'qualification': avis => _.isEmpty(avis.qualification) ? '' : avis.qualification,
        }),
        encodeIntoUTF8(),
        fs.createWriteStream(csvFile)
    ]);
});
