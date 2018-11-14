const moment = require('moment');
const getFormationsFromCSV = require('./utils/getFormationsFromCSV');

module.exports = async (db, logger, file) => {
    let start = moment();
    let total = 0;
    let collection = db.collection('intercarif');

    await collection.deleteMany({});

    await new Promise((resolve, reject) => {
        getFormationsFromCSV(file)
        .flatMap(async document => collection.insertOne(document))
        .subscribe(
            () => {
                let timeElapsed = moment().diff(start, 'seconds');
                logger.debug(`New formation inserted (${++total} documents / time elapsed: ${timeElapsed}s)`);
            },
            err => reject(err),
            () => resolve(),
        );
    });

    return Promise.all([
        collection.createIndex({ '_attributes.numero': 1 }, { background: true }),
        collection.createIndex({ 'certifications.code_certifinfo': 1 }, { background: true }),
        collection.createIndex({ 'domaine_formation.code_formacode._value': 1 }, { background: true }),
        collection.createIndex({ 'actions.sessions._attributes.numero': 1 }, { background: true }),
        collection.createIndex({ 'actions.organisme_formateur.siret_formateur.siret': 1 }, { background: true }),
        collection.createIndex({ 'actions.lieu_de_formation.coordonnees.adresse.codepostal': 1 }, { background: true }),
        collection.createIndex({ 'actions.lieu_de_formation.coordonnees.adresse.region': 1 }, { background: true }),
        collection.createIndex({ 'organisme_formation_responsable.siret_organisme-formation.siret': 1 }, { background: true }),
        collection.createIndex({ 'organisme_formation_responsable._attributes.numero': 1 }, { background: true }),
        collection.createIndex({ 'organisme_formation_responsable.coordonnees_organisme.coordonnees.adresse.region': 1 },
            { name: 'intercarif.organisme_formation_responsable.region', background: true }),
    ]);
};

