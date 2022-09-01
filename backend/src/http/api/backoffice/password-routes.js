const express = require('express');
const Joi = require('joi');
const Boom = require('boom');
const { tryAndCatch } = require('../../utils/routes-utils');

module.exports = ({ db, emails, passwords }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { hashPassword, isPasswordStrongEnough } = passwords;

    router.put('/api/backoffice/askNewPassword', tryAndCatch(async (req, res) => {

        let { identifiant } = await Joi.validate(req.body, {
            identifiant: Joi.string().required(),
        }, { abortEarly: false });

        let account = await db.collection('accounts').findOne({
            $or: [
                { identifiant },
                { siret: identifiant },
            ]
        });

        if (account) {
            let message = emails.getEmailMessageByTemplateName('forgottenPasswordEmail');
            await message.send(account);
        }

        return res.json({ 'message': 'Si votre identifiant est correct, vous allez recevoir un email vous permettant de réinitialiser votre mot de passe.' });
    }));

    router.get('/api/backoffice/checkIfPasswordTokenExists', async (req, res) => {
        try {
            let { token } = await Joi.validate(req.query, {
                token: Joi.string().required(),
            }, { abortEarly: false });
            let result = await db.collection('forgottenPasswordTokens').findOne({ token: token });

            if (result) {
                res.json({ 'message': 'token exists' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        } catch(err) {
            res.status(500).send({ });
        }
    });

    router.put('/api/backoffice/resetPassword', tryAndCatch(async (req, res) => {

        let { password, token } = await Joi.validate(req.body, {
            password: Joi.string().required(),
            token: Joi.string().required(),
        }, { abortEarly: false });

        let forgottenPasswordToken = await db.collection('forgottenPasswordTokens').findOne({ token });
        if (!forgottenPasswordToken) {
            throw Boom.badRequest('Numéro de token invalide');
        }

        let account = await db.collection('accounts').findOne({ _id: forgottenPasswordToken.id });
        if (account) {
            if (isPasswordStrongEnough(password)) {
                let passwordHash = await hashPassword(password);
                await Promise.all([
                    db.collection('forgottenPasswordTokens').remove({ token }),
                    db.collection('accounts').updateOne({ _id: account._id }, {
                        $set: {
                            'meta.rehashed': true,
                            'passwordHash': passwordHash,
                        }
                    }),
                ]);

                return res.json({});

            } else {
                throw Boom.badRequest(`Le mot de passe n'est pas valide.`);
            }
        }

    }));

    return router;
};
