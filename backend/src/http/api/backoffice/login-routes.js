const express = require('express');
const _ = require('lodash');
const Boom = require('boom');
const Joi = require('joi');
const { tryAndCatch } = require('../../utils/routes-utils');

module.exports = ({ db, auth, passwords, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let { checkPassword, hashPassword } = passwords;

    const logLoginEvent = (identifiant, account) => {
        return db.collection('events').insertOne({
            date: new Date(),
            type: 'login',
            source: { user: identifiant, profile: account.profile, id: account.profile }
        });
    };

    const logLoginWithAccessTokenEvent = (req, organisme) => {
        return db.collection('events').insertOne({
            date: new Date(),
            type: 'login-access-token',
            source: {
                profile: 'organisme',
                siret: organisme.meta.siretAsString,
                id: organisme._id,
            }
        });
    };

    const handleLogin = async (identifiant, account) => {
        let profile = account.profile;
        let region = regions.findRegionByCodeRegion(account.codeRegion);
        logLoginEvent(identifiant, account);

        return await auth.buildJWT('backoffice', {
            sub: `${identifiant}`,
            id: account._id,
            profile,
            region: region.nom,
            codeRegion: account.codeRegion,
            ...(profile === 'financeur' ? { codeFinanceur: account.codeFinanceur } : {}),
            ...(profile === 'organisme' ? { siret: account.meta.siretAsString, raisonSociale: account.raisonSociale } : {}),
        });
    };

    const invalidateAuthToken = async (id, token) => {
        return db.collection('invalidAuthTokens').insertOne({
            subject: id,
            token,
            creationDate: new Date(),
        });
    };

    const isTokenAlreadyUsed = async (id, token) => {
        let count = await db.collection('invalidAuthTokens').countDocuments({
            subject: id,
            token,
        });
        return count > 0;
    };

    const rehashPassword = async (account, password) => {

        if (account.meta && account.meta.rehashed) {
            return Promise.resolve(account);
        }

        return db.collection('accounts').updateOne({ _id: account._id }, {
            $set: {
                'meta.rehashed': true,
                'passwordHash': await hashPassword(password)
            }
        });
    };

    router.post('/api/backoffice/login', tryAndCatch(async (req, res) => {

        let { identifiant, password } = await Joi.validate(req.body, {
            identifiant: Joi.string().lowercase().required(),
            password: Joi.string().required(),
        }, { abortEarly: false });

        let token;
        let account = await db.collection('accounts').findOne({
            'passwordHash': { $exists: true },
            '$or': [
                { 'courriel': identifiant },
                { 'meta.siretAsString': identifiant },
            ]
        });
        if (account && await checkPassword(password, account.passwordHash)) {
            await rehashPassword(account, password);
            token = await handleLogin(req.body.identifiant, account);
        }

        if (token) {
            return res.json(token);
        } else {
            throw Boom.badRequest('Identifiant ou mot de passe invalide');
        }
    }));

    router.get('/api/backoffice/login', tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            access_token: Joi.string().required(),
            origin: Joi.string(),
        }, { abortEarly: false });

        let user;
        try {
            user = await auth.checkJWT('backoffice', parameters.access_token);
        } catch (e) {
            throw Boom.badRequest('Token invalide', e);
        }

        let organisme = await db.collection('accounts').findOne({
            'meta.siretAsString': user.sub,
        });

        if (await isTokenAlreadyUsed(organisme._id, parameters.access_token)) {
            throw Boom.badRequest('Token déjà utilisé');
        }

        if (organisme) {
            let [token] = await Promise.all([
                handleLogin(user.sub, organisme),
                invalidateAuthToken(organisme._id, parameters.access_token),
                logLoginWithAccessTokenEvent(req, organisme),
            ]);
            return res.json(token);
        } else {
            throw Boom.badRequest('Token invalide');
        }
    }));

    return router;
};
