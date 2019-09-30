const express = require('express');
const { ObjectID } = require('mongodb');
const Joi = require('joi');
const Boom = require('boom');
const { tryAndCatch } = require('../../routes-utils');

module.exports = ({ db, middlewares, password, configuration }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = middlewares.createJWTAuthMiddleware('backoffice');
    let { checkPassword, hashPassword, isPasswordStrongEnough } = password;

    router.get('/backoffice/accounts/:token', tryAndCatch(async (req, res) => {

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

    router.post('/backoffice/accounts/:token/activate', tryAndCatch(async (req, res) => {
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

    router.put('/backoffice/accounts/me/updatePassword', checkAuth, tryAndCatch(async (req, res) => {

        let { id } = req.user;
        let { current, password } = await Joi.validate(req.body, {
            current: Joi.string().required(),
            password: Joi.string().required(),
        }, { abortEarly: false });

        let query = { $or: [{ _id: id }, { _id: new ObjectID(id) }] };
        let account = await db.collection('accounts').findOne(query);
        if (account && await checkPassword(current, account.passwordHash, configuration)) {

            if (isPasswordStrongEnough(password)) {
                let passwordHash = await hashPassword(password);
                await db.collection('accounts').updateOne(query, {
                    $set: {
                        'meta.rehashed': true,
                        passwordHash,
                    }
                });

                return res.json({});

            } else {
                throw Boom.badRequest('Le mot de passe doit contenir au moins une minuscule, ' +
                    'une majuscule et un chiffre et 6 caractères');
            }
        }
        throw Boom.badRequest('Le mot de passe n\'est pas correct');

    }));
    return router;
};
