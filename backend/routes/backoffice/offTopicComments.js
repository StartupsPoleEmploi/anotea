const express = require('express');
const Boom = require('boom');
const mongo = require('mongodb');
const tryAndCatch = require('../tryAndCatch');
const getCommentOwnerEmail = require('../../components/getCommentOwnerMail');

module.exports = (db, authService, logger, configuration) => {

    const mailer = require('../../components/mailer.js')(db, logger, configuration);
    const router = express.Router(); // eslint-disable-line new-cap

    const sendEmailAsync = (trainee) => {
        let contact = getCommentOwnerEmail(trainee);
        mailer.sendOffTopicCommentMail({ to: contact }, trainee, () => {
            logger.error(`Sending email to ${contact}`, err);
        }, err => {
            logger.error(`Unable to send email to ${contact}`, err);
        });
    };

    router.put('/backoffice/sendMailToOffTopicCommentOwner', tryAndCatch(async (req, res) => {

        const id = mongo.ObjectID(req.body.id);
        let comment = await db.collection('comment').findOne({ _id: id });
        let trainee = await db.collection('trainee').findOne({ token: comment.token });

        if (comment) {

            sendEmailAsync(trainee);

            return res.json({ 'message': 'mail sent' });
        }

        throw Boom.badRequest('Id invalide');
    }));

    return router;
};
