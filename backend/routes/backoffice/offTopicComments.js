const express = require('express');
const JSONStream = require('JSONStream');
const uuid = require('node-uuid');
const Boom = require('boom');
const tryAndCatch = require('../tryAndCatch');
const getCommentOwnerEmail = require('../../components/getCommentOwnerMail');

module.exports = (db, authService, logger, configuration) => {

    const mailer = require('../../components/mailer.js')(db, logger, configuration);
    const router = express.Router(); // eslint-disable-line new-cap

    const sendEmailAsync = (comment) => {
        let contact = getCommentOwnerEmail(comment);
        mailer.sendOffTopicCommentMail({ to: contact }, comment, () => {
            logger.error(`Sending email to ${contact}`, err);
        }, err => {
            logger.error(`Unable to send email to ${contact}`, err);
        });
    };

    router.get('/backoffice/sendMailToOffTopicCommentOwner/:id', tryAndCatch(async (req, res) => {

        let comment = await db.collection('comment').findOne({ _id: req.params.id });
        if (comment) {

            sendEmailAsync(comment);

            return res.json({ 'message': 'mail sent' });
        }

        throw Boom.badRequest('Id invalide');
    }));

    return router;
};
