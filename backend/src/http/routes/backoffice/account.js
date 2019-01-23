const express = require('express');
const { ObjectID } = require('mongodb');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db, password, configuration }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { checkPassword, hashPassword, isPasswordStrongEnough } = password;

    router.put('/backoffice/account/updatePassword', tryAndCatch(async (req, res, next) => {
        let actualPassword = req.body.actualPassword;
        let password = req.body.password;
        let id = req.body.id;
        let profile = req.body.profile;

        let collection = '';
        if (profile === 'organisme') {
            collection = 'organismes';
        } else if (profile === 'financer') {
            collection = 'financer';
            id = new ObjectID(id);
        } else if (profile === 'moderateur') {
            collection = 'moderator';
            id = new ObjectID(id);
        }

        try {
            let user = await db.collection(collection).findOne({ _id: id });
            if (user && await checkPassword(actualPassword, user.passwordHash, configuration)) {

                if (isPasswordStrongEnough(password)) {
                    let passwordHash = await hashPassword(password);
                    await db.collection(collection).updateOne({ _id: id }, {
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
