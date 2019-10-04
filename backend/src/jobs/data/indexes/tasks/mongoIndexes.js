module.exports = {
    trainee: db => {
        return Promise.all([
            db.collection('trainee').createIndex({ 'token': 1 }, { unique: true }),
            db.collection('trainee').createIndex({ 'trainee.email': 1, 'training.idSession': 1 }),
            db.collection('trainee').createIndex({ 'codeRegion': 1 }),
            db.collection('trainee').createIndex({ 'mailSentDate': 1 }),
            db.collection('trainee').createIndex({ 'mailSent': 1 }),
            db.collection('trainee').createIndex({ 'importDate': 1 }),
            db.collection('trainee').createIndex({ 'sourceIDF': 1 }),
            db.collection('trainee').createIndex({ 'campaign': 1 }),
            db.collection('trainee').createIndex({ 'unsubscribe': 1 }),
            db.collection('trainee').createIndex({ 'trainee.email': 1 }),
            db.collection('comment').createIndex({ 'training.place.postalCode': 1 }),
            db.collection('trainee').createIndex({ 'training.codeFinanceur': 1 }),
            db.collection('trainee').createIndex({ 'training.organisation.siret': 1 }),
            db.collection('trainee').createIndex({ 'training.scheduledEndDate': 1 }),
            db.collection('trainee').createIndex({ 'training.idFormation': 1 }),
            db.collection('trainee').createIndex({ 'training.startDate': 1 }),
            db.collection('trainee').createIndex({ 'training.infoCarif.numeroSession': 1 }),
            db.collection('trainee').createIndex({ 'avisCreated': 1 }),
            db.collection('trainee').createIndex({ 'tracking.firstRead': 1 }),
            db.collection('trainee').createIndex({ 'tracking.click': 1 }),
            db.collection('trainee').createIndex({
                'codeRegion': 1,
                'training.place.postalCode': 1,
                'training.codeFinanceur': 1,
                'training.organisation.siret': 1,
                'training.idFormation': 1,
                'training.startDate': 1,
                'training.scheduledEndDate': 1,
            }, { name: 'bo-stagiaires-stats' }),
        ]);
    },
    comment: db => {
        return Promise.all([
            db.collection('comment').createIndex({ 'formacode': 1 }),
            db.collection('comment').createIndex({ 'idSession': 1 }),
            db.collection('comment').createIndex({ 'lastModerationAction': 1 }),
            db.collection('comment').createIndex({ 'token': 1 }, { unique: true }),
            db.collection('comment').createIndex({ 'codeRegion': 1 }),
            db.collection('comment').createIndex({ 'campaign': 1 }),
            db.collection('comment').createIndex({ 'published': 1 }),
            db.collection('comment').createIndex({ 'rejected': 1 }),
            db.collection('comment').createIndex({ 'moderated': 1 }),
            db.collection('comment').createIndex({ 'qualification': 1 }),
            db.collection('comment').createIndex({ 'reported': 1 }),
            db.collection('comment').createIndex({ 'date': 1 }),
            db.collection('comment').createIndex({ 'comment': 1 }),
            db.collection('comment').createIndex({ 'training.codeFinanceur': 1 }),
            db.collection('comment').createIndex({ 'training.idFormation': 1 }),
            db.collection('comment').createIndex({ 'training.place.postalCode': 1 }),
            db.collection('comment').createIndex({ 'training.organisation.siret': 1 }),
            db.collection('comment').createIndex({ 'training.organisation.label': 1 }),
            db.collection('comment').createIndex({ 'training.certifInfo.id': 1 }),
            db.collection('comment').createIndex({ 'reponse.lastModerationAction': 1 }),
            db.collection('comment').createIndex({ 'reponse.status': 1 }),
            db.collection('comment').createIndex({ 'reponse.date': 1 }),
            db.collection('comment').createIndex({ 'meta.reconciliations': 1 }),
            db.collection('comment').createIndex({ 'training.startDate': 1 }),
            db.collection('comment').createIndex({ 'training.scheduledEndDate': 1 }),
            db.collection('comment').createIndex({
                'training.place.city': 1,
                'training.place.postalCode': 1,
                'formacode': 1,
                'training.certifInfo.id': 1,
                'rejected': 1,
                'published': 1,
                'training.organisation.siret': 1,
            }, { name: 'reconciliation' }),
            db.collection('comment').createIndex({
                'comment.title': 'text',
                'comment.text': 'text',
                'training.title': 'text',
                'training.organisation.label': 'text',
            }, { name: 'bo-search-fulltext' }),
            db.collection('trainee').createIndex({
                'codeRegion': 1,
                'training.place.postalCode': 1,
                'training.codeFinanceur': 1,
                'training.organisation.siret': 1,
                'training.idFormation': 1,
                'training.startDate': 1,
                'training.scheduledEndDate': 1,
            }, { name: 'bo-avis-stats' }),
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
            db.collection('accounts').createIndex({ 'profile': 1 }),
            db.collection('accounts').createIndex({ 'mailSentDate': 1 }),
            db.collection('accounts').createIndex({ 'tracking.firstRead': 1 }),
            db.collection('accounts').createIndex({ 'tracking.firstRead': 1 }),
        ]);
    },
    formationsReconciliees: db => {
        return Promise.all([
            db.collection('formationsReconciliees').createIndex({ 'numero': 1 }),
            db.collection('formationsReconciliees').createIndex({ 'region': 1 }),
            db.collection('formationsReconciliees').createIndex({ 'code_region': 1 }),
            db.collection('formationsReconciliees').createIndex({ 'score.nb_avis': 1 }),
            db.collection('formationsReconciliees').createIndex({ 'avis.id': 1 }),
            db.collection('formationsReconciliees').createIndex({ 'meta.import_date': 1 }),
        ]);
    },
    actionsReconciliees: db => {
        return Promise.all([
            db.collection('actionsReconciliees').createIndex({ 'numero': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'region': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'code_region': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'score.nb_avis': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'avis.id': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'meta.import_date': 1 }),
        ]);
    },
    sessionsReconciliees: db => {
        return Promise.all([
            db.collection('sessionsReconciliees').createIndex({ 'numero': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'region': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'code_region': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'score.nb_avis': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'avis.id': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'meta.import_date': 1 }),
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
    communes: db => {
        return Promise.all([
            db.collection('communes').createIndex({ 'inseeCode': 1 }, { unique: true }),
            db.collection('communes').createIndex({ 'cedex': 1 }),
            db.collection('communes').createIndex({ 'postalCode': 1 }),
        ]);
    },
    misc: db => {
        return Promise.all([
            db.collection('forgottenPasswordTokens').createIndex({ 'token': 1 }),
            db.collection('forgottenPasswordTokens').createIndex({ 'creationDate': 1 }, { expireAfterSeconds: 172800 }),
            db.collection('invalidAuthTokens').createIndex({ 'creationDate': 1 }, { expireAfterSeconds: 86400 }),
            db.collection('kairos').createIndex({ 'siret': 1 }),
            db.collection('intercarif').createIndex({ 'actions.lieu_de_formation.coordonnees.adresse.region': 1 }),
            db.collection('statistics').createIndex({ 'date': 1 }),
        ]);
    },
};
