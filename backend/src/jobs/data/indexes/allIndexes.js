module.exports = {
    departements: db => {
        return Promise.all([
            db.collection('departements').createIndex({ 'region': 'text' }),
            db.collection('departements').createIndex({ 'region_num': 1, 'dept_num': 1, 'region': 1 }),
            db.collection('departements').createIndex({ 'dept_num': 1 }),
            db.collection('departements').createIndex({
                'region': 'text'
            }),
        ]);
    },
    trainee: db => {
        return Promise.all([
            db.collection('trainee').createIndex({ 'mailSentDate': 1 }),
            db.collection('trainee').createIndex({ 'codeRegion': 1 }),
            db.collection('trainee').createIndex({ 'token': 1 }),
        ]);
    },
    comment: db => {
        return Promise.all([
            db.collection('comment').createIndex({ 'step': 1 }),
            db.collection('comment').createIndex({ 'formacode': 1 }),
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
            db.collection('comment').createIndex({
                'pseudo': 'text',
                'comment.title': 'text',
                'comment.text': 'text',
                'training.title': 'text',
                'training.organisation.label': 'text',
            }, { name: 'comment_fulltext' }),
        ]);
    },
    regions: db => {
        return Promise.all([
            db.collection('regions').createIndex({ 'codeINSEE': 1 }),
            db.collection('regions').createIndex({ 'codeRegion': 1 }),
        ]);
    },
    account: db => {
        return Promise.all([
            db.collection('account').createIndex({ 'numero': 1 }),
            db.collection('account').createIndex({ 'SIRET': 1 }),
            db.collection('account').createIndex({ 'score.nb_avis': 1 }),
            db.collection('account').createIndex({ 'lieux_de_formation.adresse.code_postal': 1 }),
            db.collection('account').createIndex({ 'lieux_de_formation.adresse.region': 1 }),
            db.collection('account').createIndex({ 'codeRegion': 1 }),
            db.collection('account').createIndex({ 'courriel': 1 }),
            db.collection('account').createIndex({ 'profile': 1 })
        ]);
    },
    sessionsReconciliees: db => {
        return Promise.all([
            db.collection('sessionsReconciliees').createIndex({ 'numero': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'region': 1 }),
            db.collection('sessionsReconciliees').createIndex({ 'score.nb_avis': 1 }),
        ]);
    },
    actionsReconciliees: db => {
        return Promise.all([
            db.collection('actionsReconciliees').createIndex({ 'numero': 1 }),
            db.collection('actionsReconciliees').createIndex({ 'region': 1 }),
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
            db.collection('mailStats').createIndex({ 'token': 1 })
        ]);
    },
};
