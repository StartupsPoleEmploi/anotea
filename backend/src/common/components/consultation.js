const ObjectID = require('mongodb').ObjectID;
const { IdNotFoundError } = require('./../errors');

module.exports = db => {

    return {
        addReponse: async (id, text) => {

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

            return result.value;
        },
        removeReponse: async id => {
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

            return result.value;
        },
        markAsRead: async (id, read) => {
            let result = await db.collection('comment').findOneAndUpdate(
                { _id: new ObjectID(id) },
                {
                    $set: {
                        read
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            return result.value;
        },
        report: async id => {
            let result = await db.collection('comment').findOneAndUpdate(
                { _id: new ObjectID(id) },
                {
                    $set: {
                        reported: true,
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

            return result.value;
        },
        unreport: async id => {
            let result = await db.collection('comment').findOneAndUpdate(
                { _id: new ObjectID(id) },
                {
                    $set: {
                        reported: false,
                        read: true,
                    }
                },
                { returnOriginal: false }
            );

            if (!result.value) {
                throw new IdNotFoundError(`Avis with identifier ${id} not found`);
            }

            return result.value;
        },
    };
};
