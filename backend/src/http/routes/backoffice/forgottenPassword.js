const express = require('express');
const Boom = require('boom');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db, mailing, password }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { hashPassword, isPasswordStrongEnough } = password;

    router.put('/backoffice/askNewPassword', tryAndCatch(async (req, res) => {

        const identifier = req.body.username;

        let organisme = await db.collection('organismes').findOne({ 'meta.siretAsString': identifier });
        if (organisme) {
            await mailing.sendForgottenPasswordEmail(organisme);
            return res.json({ 'message': 'mail sent' });
        }

        throw Boom.badRequest('Identifiant invalide');

    }));

    router.get('/backoffice/checkIfPasswordTokenExists', async (req, res) => {
        let result = await db.collection('forgottenPasswordTokens').findOne({ token: req.query.token });

        if (result) {
            res.json({ 'message': 'token exists' });
        } else {
            res.status(404).send({ 'error': 'Not found' });
        }
    });

    router.put('/backoffice/updatePassword', async (req, res, next) => {
        let token = req.body.token;
        let password = req.body.password;

        try {
            let forgottenPasswordToken = await db.collection('forgottenPasswordTokens').findOne({ token });
            if (forgottenPasswordToken) {

                let organisme = await db.collection('organismes').findOne({ _id: forgottenPasswordToken.id });

                if (organisme) {
                    if (isPasswordStrongEnough(password)) {
                        let passwordHash = await hashPassword(password);
                        await Promise.all([
                            db.collection('forgottenPasswordTokens').remove({ token }),
                            db.collection('organismes').updateOne({ _id: organisme._id }, {
                                $set: {
                                    'meta.rehashed': true,
                                    'passwordHash': passwordHash,
                                }
                            }),
                        ]);

                        return res.status(201).json({
                            message: 'Account successfully updated',
                            userInfo: { username: organisme.courriel, profile: 'organisme', id: organisme._id }
                        });

                    } else {
                        return res.status(422).send({
                            error: 'Password is not valid (at least 6 characters and one uppercase and one special character)'
                        });
                    }
                }
            }
            throw Boom.badRequest('Numéro de token invalide');

        } catch (e) {
            return next(e);
        }
    });

    return router;
};
