const express = require('express');
const Joi = require('joi');
const Boom = require('boom');
const { tryAndCatch } = require('../../routes-utils');
const getOrganismeEmail = require('../../../../common/utils/getOrganismeEmail');

module.exports = ({ db, mailing, password }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { hashPassword, isPasswordStrongEnough } = password;

    router.put('/backoffice/askNewPassword', tryAndCatch(async (req, res) => {

        let { identifiant } = await Joi.validate(req.body, {
            identifiant: Joi.string().required(),
        }, { abortEarly: false });

        let organisme = await db.collection('accounts').findOne({ 'meta.siretAsString': identifiant });
        if (organisme) {
            await mailing.sendForgottenPasswordEmail(organisme._id, getOrganismeEmail(organisme), organisme.codeRegion);
            return res.json({ 'message': 'mail sent' });
        }

        let account = await db.collection('accounts').findOne({ courriel: identifiant });
        if (account) {
            await mailing.sendForgottenPasswordEmail(account._id, account.courriel, account.codeRegion);
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

    router.put('/backoffice/resetPassword', tryAndCatch(async (req, res) => {

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

                return res.status(200).json({});

            } else {
                throw Boom.badRequest(`Le mot de passe n'est pas valide.`);
            }
        }

    }));

    return router;
};
