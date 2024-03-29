const express = require('express');
const { ObjectID } = require('mongodb');
const Joi = require('joi');
const Boom = require('boom');
const { tryAndCatch } = require('../../utils/routes-utils');

module.exports = ({ db, middlewares, passwords }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = middlewares.createJWTAuthMiddleware('backoffice');
    let { checkPassword, hashPassword, isPasswordStrongEnough } = passwords;

    router.put('/api/backoffice/me/updatePassword', checkAuth, tryAndCatch(async (req, res) => {

        let user = req.user;
        let { current, password } = await Joi.validate(req.body, {
            current: Joi.string().required(),
            password: Joi.string().required(),
        }, { abortEarly: false });

        let query = user.profile === 'organisme' ? { _id: user.id } : { _id: new ObjectID(user.id) };
        let account = await db.collection('accounts').findOne(query);
        if (await checkPassword(current, account.passwordHash)) {
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
                throw Boom.badRequest('Le mot de passe doit contenir au moins 8 caractères dont au moins une minuscule, une majuscule, un chiffre et un caractère spécial.');
            }
        }
        throw Boom.badRequest('Le mot de passe n\'est pas correct');
    }));
    return router;
};
