const ObjectID = require('mongodb').ObjectID;
const { IdNotFoundError } = require('./../errors');

module.exports = db => {

    const saveEvent = (id, type, data) => {
        db.collection('events').insertOne({ adviceId: id, date: new Date(), type: type, source: data });
    };

    const getShield = user => user ? { codeRegion: user.codeRegion } : {};

    return {
        publish: async (id, qualification, options = {}) => {

            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...getShield(user),
                },
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
                user: user ? user.id : 'admin',
                profile: 'moderateur',
            });

            return result.value;


        },
        reject: async (id, qualification, options = {}) => {

            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...getShield(user),
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
                user: user ? user.id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        edit: async (id, text, options = {}) => {

            let oid = new ObjectID(id);
            let previous = await db.collection('comment').findOne({ _id: oid });
            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: oid,
                    ...getShield(user),
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
                user: user ? user.id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        delete: async (id, options = {}) => {

            let { user } = options;

            let results = await db.collection('comment').removeOne({
                _id: new ObjectID(id),
                ...getShield(user),
            });

            if (results.result.n !== 1) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            saveEvent(id, 'delete', {
                app: 'moderation',
                user: user ? user.id : 'admin',
                profile: 'moderateur',
            });
        },
        maskPseudo: async (id, mask, options = {}) => {

            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...getShield(user),
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
                user: user ? user.id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        maskTitle: async (id, mask, options = {}) => {

            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...getShield(user),
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
                user: user ? user.id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        publishReponse: async (id, options = {}) => {

            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...getShield(user),
                },
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
                user: user ? user.id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
        rejectReponse: async (id, options = {}) => {

            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...getShield(user),
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
                user: user ? user.id : 'admin',
                profile: 'moderateur',
            });

            return result.value;
        },
    };
};
