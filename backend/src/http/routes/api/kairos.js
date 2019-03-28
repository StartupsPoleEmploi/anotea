const express = require('express');
const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const _ = require('lodash');
const configuration = require('config');
const { tryAndCatch } = require('../routes-utils');
const convertToExposableOrganismeFomateur = require('./v1/dto/convertToExposableOrganismeFomateur');
const getCodeRegionFromKairosRegionName = require('../../../jobs/import/organismes/kairos/getCodeRegionFromKairosRegionName');

module.exports = ({ db, auth, middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware } = middlewares;
    let checkAuth = createJWTAuthMiddleware('kairos', {
        externalToken: true,
        onInvalidToken: e => {
            let message = e.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide';
            throw Boom.unauthorized(message, e);
        }
    });

    let generateAuthUrlRoute = tryAndCatch(async (req, res) => {

        let parameters = await Joi.validate(req.body, {
            siret: Joi.string().required(),
            raison_sociale: Joi.string().required(),
            courriel: Joi.string().email().required(),
            region: Joi.string().required(),
        }, { abortEarly: false });


        let organisme = await db.collection('accounts').findOne({ 'meta.siretAsString': parameters.siret });
        let created = false;

        let buildAccount = async data => {
            let codeRegion = getCodeRegionFromKairosRegionName(data.region);
            console.log(JSON.stringify({ meta: 'kairos.js:38', data: codeRegion},null,2));
            return {
                _id: parseInt(data.siret),
                SIRET: parseInt(data.siret),
                raisonSociale: data.raison_sociale,
                courriel: data.courriel,
                courriels: [data.courriel],
                kairosCourriel: data.courriel,
                profile: 'organisme',
                token: uuid.v4(),
                creationDate: new Date(),
                sources: ['kairos', 'sso'],
                codeRegion: codeRegion,
                numero: null,
                lieux_de_formation: [],
                meta: {
                    siretAsString: data.siret,
                },
            };
        };

        let getAccessToken = async () => {
            let token = await auth.buildJWT('backoffice', {
                sub: organisme.meta.siretAsString,
                profile: 'organisme',
                id: organisme._id,
                raisonSociale: organisme.raisonSociale,
            });
            return token.access_token;
        };

        if (!organisme) {
            organisme = await buildAccount(parameters);
            await db.collection('accounts').insertOne(organisme);
            created = true;
        }

        let accessToken = await getAccessToken(organisme);

        return res.json({
            url: `${configuration.app.public_hostname}/admin?action=loginWithAccessToken&kairos=true&access_token=${accessToken}`,
            meta: {
                created,
                organisme: convertToExposableOrganismeFomateur(organisme),
            }
        });
    });

    //Deprecated route
    router.post('/backoffice/generate-auth-url', checkAuth, generateAuthUrlRoute);
    router.post('/kairos/generate-auth-url', checkAuth, generateAuthUrlRoute);

    router.get('/kairos/check-if-organisme-is-eligible', checkAuth, tryAndCatch(async (req, res) => {

        let parameters = await Joi.validate(req.query, {
            siret: Joi.string().required(),
        }, { abortEarly: false });

        let organisme = await db.collection('accounts').findOne({ 'meta.siretAsString': parameters.siret });

        if (!organisme) {
            throw Boom.badRequest('Numéro de siret invalide');
        }

        return res.json({
            eligible: !!_.get(organisme, 'meta.kairos.eligible') && _.get(organisme, 'score.nb_avis') > 0,
            meta: {
                organisme: convertToExposableOrganismeFomateur(organisme)
            }
        });
    }));

    return router;
};
