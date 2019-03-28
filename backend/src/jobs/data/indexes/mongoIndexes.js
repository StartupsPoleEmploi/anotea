module.exports = {
    trainee: db => {
        return Promise.all([
            db.collection('trainee').createIndex({ 'mailSentDate': 1 }),
            db.collection('trainee').createIndex({ 'codeRegion': 1 }),
            db.collection('trainee').createIndex({ 'token': 1 }),
            db.collection('trainee').createIndex({ 'trainee.email': 1 }),
            db.collection('trainee').createIndex({ 'trainee.dnIndividuNational': 1 }),
            db.collection('trainee').createIndex({ 'training.codeFinanceur': 1 }),
            //Used during import of stagiaires
            db.collection('trainee').createIndex({ 'trainee.email': 1, 'training.infoCarif.numeroSession': 1 }),
        ]);
    },
    comment: db => {
        return Promise.all([
            db.collection('comment').createIndex({ 'formacode': 1 }),
            db.collection('comment').createIndex({ 'idSession': 1 }),
            db.collection('comment').createIndex({ 'lastModerationAction': 1 }),
            db.collection('comment').createIndex({ 'token': 1 }),
            db.collection('comment').createIndex({ 'codeRegion': 1 }),
            db.collection('comment').createIndex({ 'campaign': 1 }),
            db.collection('comment').createIndex({ 'published': 1 }),
            db.collection('comment').createIndex({ 'rejected': 1 }),
            db.collection('comment').createIndex({ 'moderated': 1 }),
            db.collection('comment').createIndex({ 'reported': 1 }),
            db.collection('comment').createIndex({ 'date': 1 }),
            db.collection('comment').createIndex({ 'comment': 1 }),
            db.collection('comment').createIndex({ 'training.idFormation': 1 }),
            db.collection('comment').createIndex({ 'training.place.postalCode': 1 }),
            db.collection('comment').createIndex({ 'training.organisation.siret': 1 }),
            db.collection('comment').createIndex({ 'training.organisation.label': 1 }),
            db.collection('comment').createIndex({ 'training.organisation.siret': 1 }),
            db.collection('comment').createIndex({ 'training.certifInfo.id': 1 }),
            db.collection('comment').createIndex({ 'reponse.lastModerationAction': 1 }),
            db.collection('comment').createIndex({ 'reponse.status': 1 }),
            db.collection('comment').createIndex({ 'reponse.date': 1 }),
        ]);
    },
    accounts: db => {
        return Promise.all([
            db.collection('accounts').createIndex({ 'numero': 1 }),
            db.collection('accounts').createIndex({ 'SIRET': 1 }),
            db.collection('accounts').createIndex({ 'score.nb_avis': 1 }),
            db.collection('accounts').createIndex({ 'lieux_de_formation.adresse.code_postal': 1 }),
            db.collection('accounts').createIndex({ 'lieux_de_formation.adresse.region': 1 }),
            db.collection('accounts').createIndex({ 'codeRegion': 1 }),
            db.collection('accounts').createIndex({ 'courriel': 1 }),
            db.collection('accounts').createIndex({ 'profile': 1 })
        ]);
    },
    sessionsReconciliees: db => {
        return Promise.all([
            db.collection('sessionsReconciliees').createIndex({ 'numero': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'region': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'code_region': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'score.nb_avis': 1 }),
        ]);
    },
    actionsReconciliees: db => {
        return Promise.all([
            db.collection('actionsReconciliees').createIndex({ 'numero': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'region': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'code_region': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'score.nb_avis': 1 }),
        ]);
    },
    events: db => {
        return Promise.all([
            db.collection('events').createIndex({ 'source.profile': 1 }),
            db.collection('events').createIndex({ 'source.user': 1 }),
            db.collection('events').createIndex({ 'type': 1 }),
            db.collection('events').createIndex({ 'date': 1 }),
        ]);
    },
    misc: db => {
        return Promise.all([
            db.collection('forgottenPasswordTokens').createIndex({ 'token': 1 }),
            db.collection('forgottenPasswordTokens').createIndex({ 'creationDate': 1 }, { expireAfterSeconds: 172800 }),
            db.collection('invalidAuthTokens').createIndex({ 'creationDate': 1 }, { expireAfterSeconds: 86400 }),
            db.collection('mailStats').createIndex({ 'token': 1 }),
            db.collection('kairos_organismes').createIndex({ 'siret': 1 }),
            db.collection('intercarif').createIndex({ 'actions.lieu_de_formation.coordonnees.adresse.region': 1 }),
        ]);
    },
};
