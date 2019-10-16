const ObjectID = require('mongodb').ObjectID;
const { IdNotFoundError } = require('./../errors');

module.exports = db => {

    const saveEvent = (id, type, data) => {
        db.collection('events').insertOne({ adviceId: id, date: new Date(), type: type, source: data });
    };
    const getShield = user => user ? { 'training.organisation.siret': new RegExp(`^${user.siret}`) } : {};

    return {
        addReponse: async (id, text, options = {}) => {

            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...getShield(user)
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
                user: user ? user.id : 'admin',
            });

            return result.value;
        },
        removeReponse: async (id, options = {}) => {

            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...getShield(user)
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
                user: user ? user.id : 'admin',
            });

            return result.value;
        },
        markAsRead: async (id, status, options = {}) => {

            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...getShield(user)
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
                user: user ? user.id : 'admin',
            });

            return result.value;
        },
        report: async (id, status, options = {}) => {

            let { user } = options;

            let result = await db.collection('comment').findOneAndUpdate(
                {
                    _id: new ObjectID(id),
                    ...getShield(user)
                },
                {
                    $set: {
                        'status': status ? 'reported' : 'validated',
                        'read': true,
                        'lastStatusUpdate': new Date(),
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
                user: user ? user.id : 'admin',
            });

            return result.value;
        },
    };
};
