const { getAnonymizedTitle } = require('../utils')();

module.exports = db => {
    return new Promise((resolve, reject) => {
        let stream = db.collection('trainee').find().sort({ importDate: -1 }).stream();
    
        stream.on('data', trainee => {
            const result = getAnonymizedTitle(trainee);

            if (result.changeDetected) {
                console.log(`${trainee.trainee.firstName};${trainee.trainee.name};${trainee.training.title};${result.anonymizedTitle};${trainee.importDate};${trainee.codeRegion}`);
            }
        });

        stream.on('error', () => {
            reject();
        });

        stream.on('end', () => {
            resolve();
        });
    });
};
