module.exports = function(db, logger, configuration, devMode) {

    let stream = db.collection('comment').find({ 'training.infoCarif.numeroSession': 'NULL' }).stream();

    let countNo = 0;
    let countOne = 0;
    let countSeveral = 0;

    const now = new Date();

    const addComments = function(collectionName, documents, comment) {
        documents.map(document => {
            if (document.comments === undefined) {
                document.comments = [];
            }
            document.comments.push(comment); // TODO : use $addToSet
            db.collection(collectionName).save(document);
        });
    };

    /**
     * First rule applied : actions and sessions that match SIRET + FORMACODE and which start in the future
     * !!! TODO: SIRET de l'organisme de formation et non pas le responsable !!!
     * renommer formacode en formacode principal
     */
    stream.on('data', function(comment) {
        db.collection('formations').find({
            'organisme.SIRET': parseInt(comment.training.organisation.siret),
            'domaine.formacode': comment.training.formacode
        }).toArray(function(err, trainings) {
            if (trainings.length === 0) {
                countNo++;
            } else if (trainings.length === 1) {
                countOne++;
                let training = trainings[0];
                const criteria = { 'numeroFormation': training._id, 'periode.debut': { $gte: now } };
                db.collection('actions').find(criteria).toArray(function(err, actions) {
                    addComments('actions', actions, comment);
                });
                db.collection('sessions').find(criteria).toArray(function(err, sessions) {
                    addComments('actions', sessions, comment);
                });
            } else {
                countSeveral++;
            }
        });
    });

    stream.on('end', function() {
        logger.info(`${countOne} comments added`);
    });

};
