const express = require('express');
const { ObjectId } = require('mongodb');
const Joi = require('joi');
const { badRequest } = require('@hapi/boom');
const { tryAndCatch } = require('../../utils/routes-utils');
const { updatePassowrd } = require('../../utils/validators-utils');

module.exports = ({ db, middlewares, passwords }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = middlewares.createJWTAuthMiddleware('backoffice');
    let { checkPassword, hashPassword, isPasswordStrongEnough } = passwords;

    router.put('/api/backoffice/me/updatePassword', checkAuth, tryAndCatch(async (req, res) => {

        let user = req.user;
        let { current, password } = Joi.attempt(req.body, updatePassowrd, '', { abortEarly: false });

        let query = isNaN(user.id) ?
            { '_id': new ObjectId(user.id) } :
            { '_id': user.id };
        let account = await db.collection('accounts').findOne(query);
        if (account && await checkPassword(current, account.passwordHash)) {
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
                throw badRequest('Le mot de passe doit contenir au moins 8 caractères dont au moins une minuscule, une majuscule, un chiffre et un caractère spécial.');
            }
        }
        throw badRequest('Le mot de passe n\'est pas correct');
    }));
    return router;
};
