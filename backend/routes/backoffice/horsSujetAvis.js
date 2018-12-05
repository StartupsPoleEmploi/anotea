const express = require('express');
const Boom = require('boom');
const mongo = require('mongodb');
const tryAndCatch = require('../tryAndCatch');

module.exports = (db, authService, logger, configuration) => {

    const mailer = require('../../components/mailer.js')(db, logger, configuration);
    const router = express.Router(); // eslint-disable-line new-cap

    const sendEmailAsync = (trainee, comment) => {
        let contact = trainee.trainee.email;
        mailer.sendAvisHorsSujetMail({ to: contact }, trainee, comment, () => {
            logger.error(`Sending email to ${contact}`, err);
        }, err => {
            logger.error(`Unable to send email to ${contact}`, err);
        });
    };

    router.put('/backoffice/sendAvisHorsSujetEmail', tryAndCatch(async (req, res) => {

        const id = mongo.ObjectID(req.body.id);
        let comment = await db.collection('comment').findOne({ _id: id });
        let trainee = await db.collection('trainee').findOne({ token: comment.token });

        if (comment) {

            sendEmailAsync(trainee, comment);

            return res.json({ 'message': 'mail sent' });
        }

        throw Boom.badRequest('Id invalide');
    }));

    return router;
};
