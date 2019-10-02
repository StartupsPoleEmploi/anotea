const ObjectID = require('mongodb').ObjectID;
const { IdNotFoundError } = require('./../errors');

module.exports = db => {

    const saveEvent = (id, type, source) => {
        db.collection('events').save({ adviceId: id, date: new Date(), type, source });
    };

    return {
        addReponse: async (id, text, options = {}) => {

            let result = await db.collection('comment').findOneAndUpdate(
                { _id: new ObjectID(id) },
                {
                    $set: {
                        reponse: {
                            text: text,
                            date: new Date(),
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
                ...(options.events || {}),
            });

            return result.value;
        },
        removeReponse: async (id, options = {}) => {
            let result = await db.collection('comment').findOneAndUpdate(
                { _id: new ObjectID(id) },
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
                ...(options.events || {}),
            });

            return result.value;
        },
        markAsRead: async (id, status, options = {}) => {
            let result = await db.collection('comment').findOneAndUpdate(
                { _id: new ObjectID(id) },
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
                ...(options.events || {}),
            });

            return result.value;
        },
        report: async (id, status, options = {}) => {
            let result = await db.collection('comment').findOneAndUpdate(
                { _id: new ObjectID(id) },
                {
                    $set: {
                        reported: status,
                        rejected: false,
                        published: false,
                        read: true,
                        lastStatusUpdate: new Date(),
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
                ...(options.events || {}),
            });

            return result.value;
        },
    };
};
