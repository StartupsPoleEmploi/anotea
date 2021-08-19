module.exports = {
    stagiaires: db => {
        return Promise.all([
            db.collection('stagiaires').createIndex({ 'token': 1 }, { unique: true }),
            db.collection('stagiaires').createIndex({ 'codeRegion': 1 }),
            db.collection('stagiaires').createIndex({ 'refreshKey': 1 }),
            db.collection('stagiaires').createIndex({ 'mailSentDate': 1 }),
            db.collection('stagiaires').createIndex({ 'mailSent': 1 }),
            db.collection('stagiaires').createIndex({ 'importDate': 1 }),
            db.collection('stagiaires').createIndex({ 'sourceIDF': 1 }),
            db.collection('stagiaires').createIndex({ 'campaign': 1 }),
            db.collection('stagiaires').createIndex({ 'unsubscribe': 1 }),
            db.collection('stagiaires').createIndex({ 'dispositifFinancement': 1 }),
            db.collection('stagiaires').createIndex({ 'individu.email': 1 }),
            db.collection('stagiaires').createIndex({ 'individu.identifiant_pe': 1 }),
            db.collection('stagiaires').createIndex({ 'formation.action.organisme_financeurs.code_financeur': 1 }),
            db.collection('stagiaires').createIndex({ 'formation.action.organisme_formateur.siret': 1 }),
            db.collection('stagiaires').createIndex({ 'formation.action.session.periode.fin': 1 }),
            db.collection('stagiaires').createIndex({ 'formation.action.session.periode.debut': 1 }),
            db.collection('stagiaires').createIndex({ 'formation.numero': 1 }),
            db.collection('stagiaires').createIndex({ 'formation.action.session.numero': 1 }),
            db.collection('stagiaires').createIndex({ 'avisCreated': 1 }),
            db.collection('stagiaires').createIndex({ 'tracking.firstRead': 1 }),
            db.collection('stagiaires').createIndex({ 'tracking.click': 1 }),
            db.collection('stagiaires').createIndex({ 'individu.email': 1, 'formation.action.session.id': 1 }),
            db.collection('stagiaires').createIndex({
                'codeRegion': 1,
                'formation.action.lieu_de_formation.code_postal': 1,
                'formation.action.organisme_financeurs.code_financeur': 1,
                'formation.action.organisme_formateur.siret': 1,
                'formation.intitule': 1,
                'formation.action.session.periode.debut': 1,
                'formation.action.session.periode.fin': 1,
            }, { name: 'bo-stagiaires-stats' }),
            db.collection('stagiaires').createIndex({ 'formation.action.session.id': 1 }),
            db.collection('stagiaires').createIndex({ 'formation.action.session.nbStagiaires': 1 }),
        ]);
    },
    avis: db => {
        return Promise.all([
            db.collection('avis').createIndex({ 'lastStatusUpdate': 1 }),
            db.collection('avis').createIndex({ 'token': 1 }, { unique: true }),
            db.collection('avis').createIndex({ 'codeRegion': 1 }),
            db.collection('avis').createIndex({ 'refreshKey': 1 }),
            db.collection('avis').createIndex({ 'campaign': 1 }),
            db.collection('avis').createIndex({ 'status': 1 }),
            db.collection('avis').createIndex({ 'qualification': 1 }),
            db.collection('avis').createIndex({ 'date': 1 }),
            db.collection('avis').createIndex({ 'commentaire': 1 }),
            db.collection('avis').createIndex({ 'dispositifFinancement': 1 }),
            db.collection('avis').createIndex({ 'formation.action.lieu_de_formation.code_postal': 1 }),
            db.collection('avis').createIndex({ 'formation.domaine_formation.formacodes': 1 }),
            db.collection('avis').createIndex({ 'formation.action.session.id': 1 }),
            db.collection('avis').createIndex({ 'formation.action.organisme_financeurs.code_financeur': 1 }),
            db.collection('avis').createIndex({ 'formation.numero': 1 }),
            db.collection('avis').createIndex({ 'formation.action.lieu_de_formation.code_postal': 1 }),
            db.collection('avis').createIndex({ 'formation.action.organisme_formateur.siret': 1 }),
            db.collection('avis').createIndex({ 'formation.action.organisme_formateur.raison_sociale': 1 }),
            db.collection('avis').createIndex({ 'formation.certifications': 1 }),
            db.collection('avis').createIndex({ 'reponse.lastStatusUpdate': 1 }),
            db.collection('avis').createIndex({ 'reponse.status': 1 }),
            db.collection('avis').createIndex({ 'reponse.date': 1 }),
            db.collection('avis').createIndex({ 'meta.reconciliations': 1 }),
            db.collection('avis').createIndex({ 'formation.action.session.periode.debut': 1 }),
            db.collection('avis').createIndex({ 'formation.action.session.periode.fin': 1 }),
            db.collection('avis').createIndex({
                'formation.action.lieu_de_formation.ville': 1,
                'formation.action.lieu_de_formation.code_postal': 1,
                'status': 1,
                'validated': 1,
                'formation.action.organisme_formateur.siret': 1,
            }, { name: 'reconciliation' }),
            db.collection('avis').createIndex({
                'commentaire.title': 'text',
                'commentaire.text': 'text',
                'formation.intitule': 'text',
                'formation.action.organisme_formateur.raison_sociale': 'text',
            }, { name: 'bo-search-fulltext' }),
            db.collection('avis').createIndex({
                'codeRegion': 1,
                'formation.action.lieu_de_formation.code_postal': 1,
                'formation.action.organisme_financeurs.code_financeur': 1,
                'formation.action.organisme_formateur.siret': 1,
                'formation.numero': 1,
                'formation.action.session.periode.debut': 1,
                'formation.action.session.periode.fin': 1,
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
                partialFilterExpression: { profile: 'organisme' },
            }),
            db.collection('accounts').createIndex({ 'identifiant': 1 }, {
                unique: true,
                partialFilterExpression: { identifiant: { $exists: true } },
            }),
        ]);
    },
    formationsReconciliees: db => {
        return Promise.all([
            db.collection('formationsReconciliees').createIndex({ 'numero': 1 }),
            db.collection('formationsReconciliees').createIndex({ 'region': 1 }),
            db.collection('formationsReconciliees').createIndex({ 'score.nb_avis': 1 }),
            db.collection('formationsReconciliees').createIndex({ 'avis._id': 1 }),
            db.collection('formationsReconciliees').createIndex({ 'meta.import_date': 1 }),
        ]);
    },
    actionsReconciliees: db => {
        return Promise.all([
            db.collection('actionsReconciliees').createIndex({ 'numero': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'region': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'score.nb_avis': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'avis._id': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'meta.import_date': 1 }),
        ]);
    },
    sessionsReconciliees: db => {
        return Promise.all([
            db.collection('sessionsReconciliees').createIndex({ 'numero': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'region': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'score.nb_avis': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'avis._id': 1 }),
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
