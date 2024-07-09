const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
const { IdNotFoundError, ForbiddenError } = require('./../errors');
const Boom = require('boom');

module.exports = (db, logger, emails) => {

    const saveEvent = (id, type, data) => {
        db.collection('events').insertOne({ adviceId: id, date: new Date(), type: type, source: data });
    };

    const ensureProfile = (profile, expected) => {
        if (profile && profile.type !== expected) {
            throw new ForbiddenError(`User can not perform this action`);
        }
        return profile;
    };

    const sendEmail = callback => {
        return callback()
        .catch(e => logger.error(e, 'Unable to send email'));
    };

    return {
        validate: async (id, qualification, options = {}) => {

            let profile = ensureProfile(options.profile, 'moderateur');
            let original = await db.collection('avis').findOne({ _id: new ObjectID(id) });

            let result = await db.collection('avis').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        status: 'validated',
                        qualification: qualification,
                        lastStatusUpdate: new Date(),
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'validate', {
                app: 'moderation',
                user: profile ? profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            if (options.sendEmail && original.status === 'reported') {
                sendEmail(async () => {
                    let organisme = await db.collection('accounts').findOne({
                        siret: original.formation.action.organisme_formateur.siret,
                    });

                    let message = emails.getEmailMessageByTemplateName('avisReportedCanceledEmail');
                    return message.send(organisme, original);
                });
            }

            return result.value;


        },
        reject: async (id, qualification, options = {}) => {

            let profile = ensureProfile(options.profile, 'moderateur');
            let original = await db.collection('avis').findOne({ _id: new ObjectID(id) });

            let result = await db.collection('avis').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        status: 'rejected',
                        qualification: qualification,
                        lastStatusUpdate: new Date(),
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'reject', {
                app: 'moderation',
                user: profile ? profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            if (options.sendEmail) {
                if (original.status === 'reported') {
                    sendEmail(async () => {
                        let organisme = await db.collection('accounts').findOne({
                            siret: original.formation.action.organisme_formateur.siret,
                        });

                        let message = emails.getEmailMessageByTemplateName('avisReportedConfirmedEmail');
                        return message.send(organisme, original);
                    });
                }

                if ((qualification === 'injure' || qualification === 'alerte')) {
                    let stagiaire = await db.collection('stagiaires').findOne({ token: original.token });
                    if (!stagiaire.individu || !stagiaire.individu.email) {
                        throw Boom.badRequest(`Avis rejeté, cependant le stagiaire n'a pas pu être notifié. `);
                    }
                    sendEmail(async () => {
                        let message = emails.getEmailMessageByTemplateName(`avisRejected${_.capitalize(qualification)}Email`);
                        return message.send(stagiaire);
                    });
                }
            }

            return result.value;
        },
        edit: async (id, text, options = {}) => {

            let profile = ensureProfile(options.profile, 'moderateur');
            let oid = new ObjectID(id);
            let previous = await db.collection('avis').findOne({ _id: oid });

            let result = await db.collection('avis').findOneAndUpdate(
                {
                    _id: oid,
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        'commentaire.text': text,
                        'lastStatusUpdate': new Date(),
                    },
                    $push: {
                        'meta.history': {
                            $each: [{
                                date: new Date(),
                                commentaire: { text: previous.commentaire.text }
                            }],
                            $position: 0,
                        },
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'edit', {
                app: 'moderation',
                user: profile ? profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        delete: async (id, options = {}) => {

            let profile = ensureProfile(options.profile, 'moderateur');
            let oid = new ObjectID(id);
            let previous = await db.collection('avis').findOne({ _id: oid });

            let [results] = await Promise.all([
                db.collection('avis').removeOne({ _id: oid, ...(profile ? profile.getShield() : {}) }),
                db.collection('stagiaires').updateOne({ token: previous.token }, {
                    $set: {
                        avisCreated: false,
                    }
                })
            ]);

            if (results.result.n !== 1) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'delete', {
                app: 'moderation',
                user: profile ? profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            if (options.sendEmail) {
                let stagiaire = await db.collection('stagiaires').findOne({ token: previous.token });
                if (!stagiaire.individu || !stagiaire.individu.email) {
                    throw Boom.badRequest(`Avis supprimé, cependant le courriel n'a pas pu être renvoyé. `);
                }
                sendEmail(async () => {
                    let message = emails.getEmailMessageByTemplateName('avisStagiaireEmail');
                    return message.send(stagiaire);
                });
            }
        },
        maskTitle: async (id, mask, options = {}) => {

            let profile = ensureProfile(options.profile, 'moderateur');

            let result = await db.collection('avis').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        'commentaire.titleMasked': mask
                    }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'maskTitle', {
                app: 'moderation',
                user: profile ? profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        validateReponse: async (id, options = {}) => {

            let profile = ensureProfile(options.profile, 'moderateur');

            let result = await db.collection('avis').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        'reponse.status': 'validated',
                        'reponse.lastStatusUpdate': new Date(),
                    }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'validateReponse', {
                app: 'moderation',
                user: profile ? profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        rejectReponse: async (id, options = {}) => {

            let profile = ensureProfile(options.profile, 'moderateur');
            let oid = new ObjectID(id);
            let original = await db.collection('avis').findOne({ _id: oid });

            let result = await db.collection('avis').findOneAndUpdate(
                {
                    _id: oid,
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        'reponse.status': 'rejected',
                        'reponse.lastStatusUpdate': new Date(),
                    }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'rejectReponse', {
                app: 'moderation',
                user: profile ? profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            if (options.sendEmail) {
                sendEmail(async () => {
                    let organisme = await db.collection('accounts').findOne({
                        siret: original.formation.action.organisme_formateur.siret,
                    });

                    let message = emails.getEmailMessageByTemplateName('reponseRejectedEmail');
                    return message.send(organisme, original);
                });
            }

            return result.value;
        },
        addReponse: async (id, text, options = {}) => {

            let profile = ensureProfile(options.profile, 'organisme');

            let result = await db.collection('avis').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        reponse: {
                            text: text,
                            date: new Date(),
                            lastStatusUpdate: new Date(),
                            status: 'none',
                        },
                        read: true,
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'reponse', {
                app: 'organisation',
                profile: 'organisme',
                reponse: text,
                user: profile ? profile.getUser().id : 'admin',
            });

            return result.value;
        },
        removeReponse: async (id, options = {}) => {

            let profile = ensureProfile(options.profile, 'organisme');

            let result = await db.collection('avis').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $unset: {
                        reponse: 1
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'reponse-removed', {
                app: 'organisation',
                profile: 'organisme',
                user: profile ? profile.getUser().id : 'admin',
            });

            return result.value;
        },
        markAsRead: async (id, status, options = {}) => {

            let profile = ensureProfile(options.profile, 'organisme');

            let result = await db.collection('avis').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        read: status
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'mark-as-read', {
                app: 'organisation',
                profile: 'organisme',
                user: profile ? profile.getUser().id : 'admin',
            });

            return result.value;
        },
        report: async (id, status, commentReport, options = {}) => {

            let profile = ensureProfile(options.profile, 'organisme');

            let result = await db.collection('avis').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                    commentaire: { $exists: true }
                },
                {
                    $set: {
                        'status': status ? 'reported' : 'validated',
                        'commentReport': commentReport,
                        'read': true,
                        'lastStatusUpdate': new Date(),
                    },
                    $unset: {
                        'qualification': 1,
                    }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'unreport', {
                app: 'organisation',
                profile: 'organisme',
                user: profile ? profile.getUser().id : 'admin',
            });

            return result.value;
        },
    };
};
