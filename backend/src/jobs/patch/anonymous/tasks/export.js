const fs = require('fs');
const { getAnonymizedTitle } = require('../utils')();
const getRegions = require('../../../../core/components/regions');

module.exports = (db, path) => {
    return new Promise((resolve, reject) => {
        let streamOut = fs.createWriteStream(path);
        let regions = getRegions();

        streamOut.once('open', function() {
            streamOut.write('Email stagiaire;Prénom;Nom;Titre datalake;Titre anonymisé;Date d\'import;Région;Avis déposés\n');
            let stream = db.collection('trainee').find().sort({ importDate: -1 }).stream();

            stream.on('data', trainee => {
                const result = getAnonymizedTitle(trainee);

                if (result.changeDetected) {
                    streamOut.write(`${trainee.trainee.email};${trainee.trainee.firstName};${trainee.trainee.name};${trainee.training.title};${result.anonymizedTitle};${trainee.importDate};${regions.findRegionByCodeRegion(trainee.codeRegion).nom};${trainee.avisCreated ? 'oui' : 'non'}\n`);
                }
            });

            stream.on('error', () => {
                reject();
            });

            stream.on('end', () => {
                streamOut.end();
                resolve();
            });
        });
    });
};
