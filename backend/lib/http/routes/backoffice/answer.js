const express = require('express');
const mongo = require('mongodb');

module.exports = ({ db, createJWTAuthMiddleware, logger }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = createJWTAuthMiddleware('backoffice');

    const saveEvent = function(id, type, source) {
        db.collection('events').save({ adviceId: id, date: new Date(), type: type, source: source });
    };

    const getRemoteAddress = req => {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    };

    router.post('/backoffice/advice/:id/answer', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        const answer = req.body.answer;
        db.collection('comment').update({ _id: id }, {
            $set: {
                answer: answer,
                answered: true,
                read: true
            }
        }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'answer', {
                    app: 'organisation',
                    user: req.query.userId,
                    ip: getRemoteAddress(req),
                    answer: answer
                });
                res.status(200).send({ 'message': 'advice answered' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.delete('/backoffice/advice/:id/answer', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, {
            $set: { answered: false },
            $unset: { answer: '' }
        }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'answer removed', {
                    app: 'organisation',
                    user: req.query.userId,
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'advice answer removed' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    return router;
};
