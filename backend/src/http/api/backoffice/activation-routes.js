const express = require('express');
const Joi = require('joi');
const Boom = require('boom');
const { tryAndCatch } = require('../../utils/routes-utils');

module.exports = ({ db, passwords }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { hashPassword, isPasswordStrongEnough } = passwords;

    router.get('/api/backoffice/activation/:token', tryAndCatch(async (req, res) => {

        let account = await db.collection('accounts').findOne({ token: req.params.token });
        if (account) {
            return res.json({
                nom: account.raisonSociale,
                identifiant: account.meta.siretAsString,
                status: account.passwordHash ? 'active' : 'inactive',
            });
        }
        throw Boom.badRequest('Numéro de token invalide');
    }));

    router.post('/api/backoffice/activation/:token', tryAndCatch(async (req, res) => {
        const token = req.params.token;

        let { password } = await Joi.validate(req.body, {
            password: Joi.string().required(),
        }, { abortEarly: false });

        let account = await db.collection('accounts').findOne({ token });
        if (account) {
            if (!account.passwordHash) {
                if (isPasswordStrongEnough(password)) {
                    await db.collection('accounts').updateOne({ token }, {
                        $set: {
                            'meta.rehashed': true,
                            'passwordHash': await hashPassword(password)
                        }
                    });

                    return res.status(201).json({});
                }
                throw Boom.badRequest('Le mot de passe est invalide (il doit contenir au moins 6 caractères, une majuscule et un caractère spécial)');
            }
        }
        throw Boom.badRequest('Numéro de token invalide');
    }));

    return router;
};
