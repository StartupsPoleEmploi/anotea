module.exports = {
    stagiaires: db => {
        return Promise.all([
            db.collection('stagiaires').createIndex({ 'token': 1 }, { unique: true }),
            db.collection('stagiaires').createIndex({ 'codeRegion': 1 }),
            db.collection('stagiaires').createIndex({ 'mailSentDate': 1 }),
            db.collection('stagiaires').createIndex({ 'mailSent': 1 }),
            db.collection('stagiaires').createIndex({ 'importDate': 1 }),
            db.collection('stagiaires').createIndex({ 'sourceIDF': 1 }),
            db.collection('stagiaires').createIndex({ 'campaign': 1 }),
            db.collection('stagiaires').createIndex({ 'unsubscribe': 1 }),
            db.collection('stagiaires').createIndex({ 'personal.email': 1 }),
            db.collection('stagiaires').createIndex({ 'personal.dnIndividuNational': 1 }),
            db.collection('stagiaires').createIndex({ 'training.codeFinanceur': 1 }),
            db.collection('stagiaires').createIndex({ 'training.organisation.siret': 1 }),
            db.collection('stagiaires').createIndex({ 'training.scheduledEndDate': 1 }),
            db.collection('stagiaires').createIndex({ 'training.idFormation': 1 }),
            db.collection('stagiaires').createIndex({ 'training.startDate': 1 }),
            db.collection('stagiaires').createIndex({ 'training.infoCarif.numeroSession': 1 }),
            db.collection('stagiaires').createIndex({ 'avisCreated': 1 }),
            db.collection('stagiaires').createIndex({ 'tracking.firstRead': 1 }),
            db.collection('stagiaires').createIndex({ 'tracking.click': 1 }),
            db.collection('stagiaires').createIndex({ 'personal.email': 1, 'training.idSession': 1 }),
            db.collection('stagiaires').createIndex({
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
            db.collection('comment').createIndex({ 'training.place.postalCode': 1 }),
            db.collection('comment').createIndex({ 'lastStatusUpdate': 1 }),
            db.collection('comment').createIndex({ 'token': 1 }, { unique: true }),
            db.collection('comment').createIndex({ 'codeRegion': 1 }),
            db.collection('comment').createIndex({ 'campaign': 1 }),
            db.collection('comment').createIndex({ 'status': 1 }),
            db.collection('comment').createIndex({ 'qualification': 1 }),
            db.collection('comment').createIndex({ 'date': 1 }),
            db.collection('comment').createIndex({ 'comment': 1 }),
            db.collection('comment').createIndex({ 'training.formacodes': 1 }),
            db.collection('comment').createIndex({ 'training.idSession': 1 }),
            db.collection('comment').createIndex({ 'training.codeFinanceur': 1 }),
            db.collection('comment').createIndex({ 'training.idFormation': 1 }),
            db.collection('comment').createIndex({ 'training.place.postalCode': 1 }),
            db.collection('comment').createIndex({ 'training.organisation.siret': 1 }),
            db.collection('comment').createIndex({ 'training.organisation.label': 1 }),
            db.collection('comment').createIndex({ 'training.certifInfos': 1 }),
            db.collection('comment').createIndex({ 'reponse.lastStatusUpdate': 1 }),
            db.collection('comment').createIndex({ 'reponse.status': 1 }),
            db.collection('comment').createIndex({ 'reponse.date': 1 }),
            db.collection('comment').createIndex({ 'meta.reconciliations': 1 }),
            db.collection('comment').createIndex({ 'training.startDate': 1 }),
            db.collection('comment').createIndex({ 'training.scheduledEndDate': 1 }),
            db.collection('comment').createIndex({
                'training.place.city': 1,
                'training.place.postalCode': 1,
                'status': 1,
                'validated': 1,
                'training.organisation.siret': 1,
            }, { name: 'reconciliation' }),
            db.collection('comment').createIndex({
                'comment.title': 'text',
                'comment.text': 'text',
                'training.title': 'text',
                'training.organisation.label': 'text',
            }, { name: 'bo-search-fulltext' }),
            db.collection('comment').createIndex({
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
            db.collection('accounts').createIndex({ 'score.nb_avis': 1 }),
            db.collection('accounts').createIndex({ 'lieux_de_formation.adresse.code_postal': 1 }),
            db.collection('accounts').createIndex({ 'lieux_de_formation.adresse.region': 1 }),
            db.collection('accounts').createIndex({ 'codeRegion': 1 }),
            db.collection('accounts').createIndex({ 'courriel': 1 }),
            db.collection('accounts').createIndex({ 'profile': 1 }),
            db.collection('accounts').createIndex({ 'mailSentDate': 1 }),
            db.collection('accounts').createIndex({ 'tracking.firstRead': 1 }),
            db.collection('accounts').createIndex({ 'tracking.firstRead': 1 }),
            db.collection('accounts').createIndex({ 'siret': 1 }, {
                unique: true,
                partialFilterExpression: { profile: 'organisme' }
            }),
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
            db.collection('peConnectTokens').createIndex({ 'creationDate': 1 }, { expireAfterSeconds: 86400 }),
            db.collection('intercarif').createIndex({ 'actions.lieu_de_formation.coordonnees.adresse.region': 1 }),
            db.collection('statistics').createIndex({ 'date': 1 }),
        ]);
    },
};
