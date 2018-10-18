/* global db */
db.trainee.ensureIndex({ token: 1 });
db.trainee.ensureIndex({ 'trainee.email': 1 });
db.trainee.ensureIndex({ 'trainee.email': 1, 'trainee.startDate': 1 });
db.trainee.ensureIndex({ token: 1, formacode: 1, idSession: 1 });
db.trainee.ensureIndex({ date: 1, mailSent: 1, mailOpen: 1 });
db.trainee.ensureIndex({ 'training.infoCarif.numeroSession': 1 });
db.trainee.ensureIndex({ mailSentDate: 1 });

db.comment.ensureIndex({ step: 1 });
db.comment.ensureIndex({ token: 1 });
db.comment.ensureIndex({ 'training.infoCarif.numeroAction': 1, 'step': 1 });
db.comment.ensureIndex({ 'training.infoCarif.numeroAction': 1, 'training.infoCarif.numeroSession': 1, 'step': 1 });
db.comment.ensureIndex({ 'training.idFormation': 1 });
db.comment.ensureIndex({ 'training.organisation.siret': 1, 'training.organisation.label': 1 });
db.comment.ensureIndex({ 'training.place.postalCode': 1 });
db.comment.ensureIndex({ campaign: 1 });
db.comment.ensureIndex({ date: 1 });
db.comment.ensureIndex({ 'trainee.email': 1, 'trainee.startDate': 1 });
db.comment.ensureIndex({ 'training.scheduledEndDate': 1, 'training.codeFinanceur': 1 });
db.comment.ensureIndex({
    'rates.accueil': 1,
    'rates.global': 1,
    'rates.accompagnement': 1,
    'rates.moyen_materiel': 1,
    'rates.equipe_formateurs': 1,
    'rates.contenu_formation': 1
});

db.sessions.ensureIndex({ 'numeroFormation': 1, 'periode.debut': 1 });

db.actions.ensureIndex({ 'numeroFormation': 1, 'periode.debut': 1 });

db.organismes.ensureIndex({ idLBF: 1 });
db.organismes.ensureIndex({ courriel: 1 });
db.organismes.ensureIndex({ raisonSociale: 'text' });

db.formations.ensureIndex({ 'organisme.SIRET': 1, 'domaine.formacode': 1 });
db.formations.ensureIndex({ 'status': 1, 'intercarif.id': 1 });

db.forgottenPasswordTokens.ensureIndex({ token: 1 });
db.forgottenPasswordTokens.ensureIndex({ expireAfterSeconds: 60 * 60 * 48 });

db.regions.ensureIndex({ 'region_num': 1, 'dept_num': 1, 'region': 1 });
db.regions.createIndex({ region: 'text' });

db.financer.ensureIndex({ courriel: 1 });

db.moderator.ensureIndex({ courriel: 1 });

db.trainee.ensureIndex({ 'codeRegion': 1 });
db.comment.ensureIndex({ 'codeRegion': 1 });

db.comment.ensureIndex({ 'trainee.email': 1 });
db.comment.ensureIndex({ 'trainee.idFormation': 1 });

db.mailStats.ensureIndex({ token: 1 });

db.regions.ensureIndex({ dept_num: 1 });
db.regions.ensureIndex({ region: 1 });
db.regions.ensureIndex({ region: 'text' });
db.regions.ensureIndex({ dept_num: 1 }, { unique: true });

db.invalidAuthTokens.createIndex({ 'creationDate': 1 }, { expireAfterSeconds: 86400 });
