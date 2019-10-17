const ObjectID = require('mongodb').ObjectID;
const { IdNotFoundError } = require('./../errors');

module.exports = db => {

    const saveEvent = (id, type, data) => {
        db.collection('events').insertOne({ adviceId: id, date: new Date(), type: type, source: data });
    };

    return {
        publish: async (id, qualification, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(options.profile ? options.profile.getShield() : {}),
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

            saveEvent(id, 'publish', {
                app: 'moderation',
                user: options.profile ? options.profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            return result.value;


        },
        reject: async (id, qualification, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(options.profile ? options.profile.getShield() : {}),
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
                user: options.profile ? options.profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        edit: async (id, text, options = {}) => {

            let oid = new ObjectID(id);
            let previous = await db.collection('comment').findOne({ _id: oid });

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: oid,
                    ...(options.profile ? options.profile.getShield() : {}),
                },
                {
                    $set: {
                        'comment.text': text,
                        'lastStatusUpdate': new Date(),
                    },
                    $push: {
                        'meta.history': {
                            $each: [{
                                date: new Date(),
                                comment: { text: previous.comment.text }
                            }],
                            $slice: 10,
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
                user: options.profile ? options.profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        delete: async (id, options = {}) => {

            let results = await db.collection('comment').removeOne({
                _id: new ObjectID(id),
                ...(options.profile ? options.profile.getShield() : {}),
            });

            if (results.result.n !== 1) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'delete', {
                app: 'moderation',
                user: options.profile ? options.profile.getUser().id : 'admin',
                profile: 'moderateur',
            });
        },
        maskPseudo: async (id, mask, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(options.profile ? options.profile.getShield() : {}),
                },
                {
                    $set: { pseudoMasked: mask }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'maskPseudo', {
                app: 'moderation',
                user: options.profile ? options.profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        maskTitle: async (id, mask, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(options.profile ? options.profile.getShield() : {}),
                },
                {
                    $set: {
                        'comment.titleMasked': mask
                    }
                },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'maskTitle', {
                app: 'moderation',
                user: options.profile ? options.profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        publishReponse: async (id, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(options.profile ? options.profile.getShield() : {}),
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

            saveEvent(id, 'publishReponse', {
                app: 'moderation',
                user: options.profile ? options.profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        rejectReponse: async (id, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(options.profile ? options.profile.getShield() : {}),
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
                user: options.profile ? options.profile.getUser().id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        addReponse: async (id, text, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(options.profile ? options.profile.getShield() : {}),
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
                user: options.profile ? options.profile.getUser().id : 'admin',
            });

            return result.value;
        },
        removeReponse: async (id, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(options.profile ? options.profile.getShield() : {}),
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
                user: options.profile ? options.profile.getUser().id : 'admin',
            });

            return result.value;
        },
        markAsRead: async (id, status, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(options.profile ? options.profile.getShield() : {}),
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
                user: options.profile ? options.profile.getUser().id : 'admin',
            });

            return result.value;
        },
        report: async (id, status, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...(options.profile ? options.profile.getShield() : {}),
                },
                {
                    $set: {
                        'status': status ? 'reported' : 'validated',
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
                user: options.profile ? options.profile.getUser().id : 'admin',
            });

            return result.value;
        },
    };
};
