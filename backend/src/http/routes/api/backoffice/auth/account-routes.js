const express = require('express');
const { ObjectID } = require('mongodb');
const Boom = require('boom');
const { tryAndCatch } = require('../../../routes-utils');

module.exports = ({ db, password, configuration }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { checkPassword, hashPassword, isPasswordStrongEnough } = password;

    router.get('/backoffice/account/:token', tryAndCatch(async (req, res) => {

        let organisme = await db.collection('accounts').findOne({ token: req.params.token });
        if (organisme) {
            return res.json({
                raisonSociale: organisme.raisonSociale,
                siret: organisme.meta.siretAsString,
                status: organisme.passwordHash ? 'active' : 'inactive',
            });
        }
        throw Boom.badRequest('Numéro de token invalide');
    }));

    router.post('/backoffice/account/activate', tryAndCatch(async (req, res) => {
        const token = req.body.token;
        const password = req.body.password;

        let organisme = await db.collection('accounts').findOne({ token });
        if (organisme) {
            if (!organisme.passwordHash) {
                if (isPasswordStrongEnough(password)) {
                    await db.collection('accounts').updateOne({ token }, {
                        $set: {
                            'meta.rehashed': true,
                            'passwordHash': await hashPassword(password)
                        }
                    });

                    return res.status(201).json({
                        message: 'Account successfully created',
                        userInfo: {
                            username: organisme.meta.siretAsString,
                            profile: 'organisme',
                            id: organisme._id
                        }
                    });
                }
                throw Boom.badRequest('Le mot de passe est invalide (il doit contenir au moins 6 caractères, une majuscule et un caractère spécial)');
            }
        }
        throw Boom.badRequest('Numéro de token invalide');
    }));

    router.put('/backoffice/account/updatePassword', tryAndCatch(async (req, res, next) => {
        let actualPassword = req.body.actualPassword;
        let password = req.body.password;
        let id = req.body.id;
        let profile = req.body.profile;

        if (profile === 'financeur') {
            id = new ObjectID(id);
        } else if (profile === 'moderateur') {
            id = new ObjectID(id);
        }

        try {
            let account = await db.collection('accounts').findOne({ _id: id });
            if (account && await checkPassword(actualPassword, account.passwordHash, configuration)) {

                if (isPasswordStrongEnough(password)) {
                    let passwordHash = await hashPassword(password);
                    await db.collection('accounts').updateOne({ _id: id }, {
                        $set: {
                            'meta.rehashed': true,
                            'passwordHash': passwordHash,
                        }
                    });

                    return res.status(201).json({
                        message: 'Account successfully updated'
                    });

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
