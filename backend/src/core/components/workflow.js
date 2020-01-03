const ObjectID = require("mongodb").ObjectID;
const _ = require("lodash");
const { IdNotFoundError, ForbiddenError } = require("./../errors");

module.exports = (db, logger, emails) => {

    const saveEvent = (id, type, data) => {
        db.collection("events").insertOne({ adviceId: id, date: new Date(), type: type, source: data });
    };

    const ensureProfile = (profile, expected) => {
        if (profile && profile.type !== expected) {
            throw new ForbiddenError(`User can not perform this action`);
        }
        return profile;
    };

    const sendEmail = callback => {
        return callback()
        .catch(e => logger.error(e, "Unable to send email"));
    };

    return {
        validate: async (id, qualification, options = {}) => {

            let profile = ensureProfile(options.profile, "moderateur");
            let original = await db.collection("comment").findOne({ _id: new ObjectID(id) });

            let result = await db.collection("comment").findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        status: "validated",
                        qualification: qualification,
                        lastStatusUpdate: new Date(),
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, "validate", {
                app: "moderation",
                user: profile ? profile.getUser().id : "admin",
                profile: "moderateur",
            });

            if (options.sendEmail && original.status === "reported") {
                sendEmail(async () => {
                    let organisme = await db.collection("accounts").findOne({
                        SIRET: parseInt(original.training.organisation.siret)
                    });

                    let message = emails.getEmailMessageByTemplateName("avisReportedCanceledEmail");
                    return message.send(organisme, original);
                });
            }

            return result.value;


        },
        reject: async (id, qualification, options = {}) => {

            let profile = ensureProfile(options.profile, "moderateur");
            let original = await db.collection("comment").findOne({ _id: new ObjectID(id) });

            let result = await db.collection("comment").findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        status: "rejected",
                        qualification: qualification,
                        lastStatusUpdate: new Date(),
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, "reject", {
                app: "moderation",
                user: profile ? profile.getUser().id : "admin",
                profile: "moderateur",
            });

            if (options.sendEmail) {
                if (original.status === "reported") {
                    sendEmail(async () => {
                        let organisme = await db.collection("accounts").findOne({
                            SIRET: parseInt(original.training.organisation.siret)
                        });

                        let message = emails.getEmailMessageByTemplateName("avisReportedConfirmedEmail");
                        return message.send(organisme, original);
                    });
                }

                if ((qualification === "injure" || qualification === "alerte")) {
                    sendEmail(async () => {
                        let trainee = await db.collection("trainee").findOne({ token: original.token });

                        let message = emails.getEmailMessageByTemplateName(`avisRejected${_.capitalize(qualification)}Email`);
                        return message.send(trainee);
                    });
                }
            }

            return result.value;
        },
        edit: async (id, text, options = {}) => {

            let profile = ensureProfile(options.profile, "moderateur");
            let oid = new ObjectID(id);
            let previous = await db.collection("comment").findOne({ _id: oid });

            let result = await db.collection("comment").findOneAndUpdate(
                {
                    _id: oid,
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        "comment.text": text,
                        "lastStatusUpdate": new Date(),
                    },
                    $push: {
                        "meta.history": {
                            $each: [{
                                date: new Date(),
                                comment: { text: previous.comment.text }
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

            saveEvent(id, "edit", {
                app: "moderation",
                user: profile ? profile.getUser().id : "admin",
                profile: "moderateur",
            });

            return result.value;
        },
        delete: async (id, options = {}) => {

            let profile = ensureProfile(options.profile, "moderateur");
            let oid = new ObjectID(id);
            let previous = await db.collection("comment").findOne({ _id: oid });

            let [results] = await Promise.all([
                db.collection("comment").removeOne({ _id: oid, ...(profile ? profile.getShield() : {}) }),
                db.collection("trainee").updateOne({ token: previous.token }, {
                    $set: {
                        avisCreated: false,
                    }
                })
            ]);

            if (results.result.n !== 1) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, "delete", {
                app: "moderation",
                user: profile ? profile.getUser().id : "admin",
                profile: "moderateur",
            });

            if (options.sendEmail) {
                sendEmail(async () => {
                    let trainee = await db.collection("trainee").findOne({ token: previous.token });
                    let message = emails.getEmailMessageByTemplateName("avisStagiaireEmail");
                    return message.send(trainee);
                });
            }
        },
        maskPseudo: async (id, mask, options = {}) => {

            let profile = ensureProfile(options.profile, "moderateur");

            let result = await db.collection("comment").findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: { pseudoMasked: mask }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, "maskPseudo", {
                app: "moderation",
                user: profile ? profile.getUser().id : "admin",
                profile: "moderateur",
            });

            return result.value;
        },
        maskTitle: async (id, mask, options = {}) => {

            let profile = ensureProfile(options.profile, "moderateur");

            let result = await db.collection("comment").findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        "comment.titleMasked": mask
                    }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, "maskTitle", {
                app: "moderation",
                user: profile ? profile.getUser().id : "admin",
                profile: "moderateur",
            });

            return result.value;
        },
        validateReponse: async (id, options = {}) => {

            let profile = ensureProfile(options.profile, "moderateur");

            let result = await db.collection("comment").findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        "reponse.status": "validated",
                        "reponse.lastStatusUpdate": new Date(),
                    }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, "validateReponse", {
                app: "moderation",
                user: profile ? profile.getUser().id : "admin",
                profile: "moderateur",
            });

            return result.value;
        },
        rejectReponse: async (id, options = {}) => {

            let profile = ensureProfile(options.profile, "moderateur");
            let oid = new ObjectID(id);
            let original = await db.collection("comment").findOne({ _id: oid });

            let result = await db.collection("comment").findOneAndUpdate(
                {
                    _id: oid,
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        "reponse.status": "rejected",
                        "reponse.lastStatusUpdate": new Date(),
                    }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, "rejectReponse", {
                app: "moderation",
                user: profile ? profile.getUser().id : "admin",
                profile: "moderateur",
            });

            if (options.sendEmail) {
                sendEmail(async () => {
                    let organisme = await db.collection("accounts").findOne({
                        SIRET: parseInt(original.training.organisation.siret)
                    });

                    let message = emails.getEmailMessageByTemplateName("reponseRejectedEmail");
                    return message.send(organisme, original);
                });
            }

            return result.value;
        },
        addReponse: async (id, text, options = {}) => {

            let profile = ensureProfile(options.profile, "organisme");

            let result = await db.collection("comment").findOneAndUpdate(
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
                            status: "none",
                        },
                        read: true,
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, "reponse", {
                app: "organisation",
                profile: "organisme",
                reponse: text,
                user: profile ? profile.getUser().id : "admin",
            });

            return result.value;
        },
        removeReponse: async (id, options = {}) => {

            let profile = ensureProfile(options.profile, "organisme");

            let result = await db.collection("comment").findOneAndUpdate(
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

            saveEvent(id, "reponse-removed", {
                app: "organisation",
                profile: "organisme",
                user: profile ? profile.getUser().id : "admin",
            });

            return result.value;
        },
        markAsRead: async (id, status, options = {}) => {

            let profile = ensureProfile(options.profile, "organisme");

            let result = await db.collection("comment").findOneAndUpdate(
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

            saveEvent(id, "mark-as-read", {
                app: "organisation",
                profile: "organisme",
                user: profile ? profile.getUser().id : "admin",
            });

            return result.value;
        },
        report: async (id, status, options = {}) => {

            let profile = ensureProfile(options.profile, "organisme");

            let result = await db.collection("comment").findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(profile ? profile.getShield() : {}),
                },
                {
                    $set: {
                        "status": status ? "reported" : "validated",
                        "read": true,
                        "lastStatusUpdate": new Date(),
                    },
                    $unset: {
                        "qualification": 1,
                    }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, "unreport", {
                app: "organisation",
                profile: "organisme",
                user: profile ? profile.getUser().id : "admin",
            });

            return result.value;
        },
    };
};
