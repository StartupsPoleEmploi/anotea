const fs = require('fs');
const { getAnonymizedTitle } = require('../utils')();

module.exports = (db, path) => {
    return new Promise((resolve, reject) => {
        let streamOut = fs.createWriteStream(path);

        streamOut.once('open', function() {
            streamOut.write('Prénom;Nom;Titre datalake;Titre anonymisé\n');
            let stream = db.collection('trainee').find().sort({ importDate: -1 }).stream();
        
            stream.on('data', trainee => {
                const result = getAnonymizedTitle(trainee);

                if (result.changeDetected) {
                    streamOut.write(`${trainee.trainee.firstName};${trainee.trainee.name};${trainee.training.title};${result.anonymizedTitle};${trainee.importDate};${trainee.codeRegion}\n`);
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
