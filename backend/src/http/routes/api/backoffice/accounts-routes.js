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
            password: Joi.string(),
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

    router.put('/backoffice/accounts/me/updatePassword', checkAuth, tryAndCatch(async (req, res, next) => {

        let { id } = req.user;
        let { actualPassword, password } = await Joi.validate(req.body, {
            actualPassword: Joi.string(),
            password: Joi.string(),
        }, { abortEarly: false });


        try {
            let account = await db.collection('accounts').findOne({ $or: [{ _id: id }, { _id: new ObjectID(id) }] });
            if (account && await checkPassword(actualPassword, account.passwordHash, configuration)) {

                if (isPasswordStrongEnough(password)) {
                    let passwordHash = await hashPassword(password);
                    await db.collection('accounts').updateOne({ _id: id }, {
                        $set: {
                            'meta.rehashed': true,
                            passwordHash,
                        }
                    });

                    return res.status(200).json();

                } else {
                    return res.status(422).send({
                        error: {
                            message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre et 6 caractères',
                            type: 'PASSWORD_NOT_STRONG'
                        }
                    });
                }
            }
            return res.status(422).send({
                error: {
                    message: 'Le mot de passe n\'est pas correct',
                    type: 'PASSWORD_INVALID'
                }
            });

        } catch (e) {
            return next(e);
        }
    }));
    return router;
};
