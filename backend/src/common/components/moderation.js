const ObjectID = require('mongodb').ObjectID;
const { IdNotFoundError } = require('./../errors');

module.exports = db => {

    const saveEvent = function(id, type, source) {
        db.collection('events').insertOne({ adviceId: id, date: new Date(), type: type, source: source });
    };

    return {
        publish: async (id, qualification, options = {}) => {

            let oid = new ObjectID(id);

            let result = await db.collection('comment').findOneAndUpdate(
                { _id: oid },
                {
                    $set: {
                        status: 'published',
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
                user: 'admin',
                profile: 'moderateur',
                ...(options.events || {}),
            });

            return result.value;


        },
        reject: async (id, qualification, options = {}) => {

            let oid = new ObjectID(id);

            let result = await db.collection('comment').findOneAndUpdate(
                { _id: oid },
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
                user: 'admin',
                profile: 'moderateur',
                ...(options.events || {}),
            });

            return result.value;
        },
        edit: async (id, text, options = {}) => {

            let oid = new ObjectID(id);
            let previous = await db.collection('comment').findOne({ _id: oid });

            let result = await db.collection('comment').findOneAndUpdate(
                { _id: oid },
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
                user: 'admin',
                profile: 'moderateur',
                ...(options.events || {}),
            });

            return result.value;
        },
        delete: async (id, options = {}) => {

            let oid = new ObjectID(id);

            let result = await db.collection('comment').removeOne({ _id: oid });

            if (!result.result.n === 1) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'delete', {
                app: 'moderation',
                user: 'admin',
                profile: 'moderateur',
                ...(options.events || {}),
            });
        },
        maskPseudo: async (id, mask, options) => {

            let oid = new ObjectID(id);

            let result = await db.collection('comment').findOneAndUpdate(
                { _id: oid },
                { $set: { pseudoMasked: mask } },
                { returnOriginal: false },
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'maskPseudo', {
                app: 'moderation',
                user: 'admin',
                profile: 'moderateur',
                ...(options.events || {}),
            });

            return result.value;
        },
        maskTitle: async (id, mask, options) => {

            let oid = new ObjectID(id);

            let result = await db.collection('comment').findOneAndUpdate(
                { _id: oid },
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
                user: 'admin',
                profile: 'moderateur',
                ...(options.events || {}),
            });

            return result.value;
        },
        publishReponse: async (id, options) => {
            let oid = new ObjectID(id);

            let result = await db.collection('comment').findOneAndUpdate(
                { _id: oid },
                {
                    $set: {
                        'reponse.status': 'published',
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
                user: 'admin',
                profile: 'moderateur',
                ...(options.events || {}),
            });

            return result.value;
        },
        rejectReponse: async (id, options) => {
            let oid = new ObjectID(id);

            let result = await db.collection('comment').findOneAndUpdate(
                { _id: oid },
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
                user: 'admin',
                profile: 'moderateur',
                ...(options.events || {}),
            });

            return result.value;
        },
    };
};
