const express = require('express');
const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const configuration = require('config');
const tryAndCatch = require('../tryAndCatch');

module.exports = ({ db, createJWTAuthMiddleware, auth }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let collection = db.collection('organismes');
    let { findCodeRegionByName } = require('../../../common/components/regions')(db);
    let checkAuth = createJWTAuthMiddleware('kairos', null, {
        externalToken: true,
        onInvalidToken: e => {
            let message = e.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide';
            throw Boom.unauthorized(message, e);
        }
    });

    const buildAccount = async data => {
        return {
            _id: parseInt(data.siret),
            SIRET: parseInt(data.siret),
            raisonSociale: data.raison_sociale,
            courriel: data.courriel,
            courriels: [data.courriel],
            kairosCourriel: data.courriel,
            token: uuid.v4(),
            creationDate: new Date(),
            sources: ['kairos', 'sso'],
            codeRegion: await findCodeRegionByName(data.region),
            numero: null,
            lieux_de_formation: [],
            meta: {
                siretAsString: data.siret,
            },
        };
    };

    router.post('/backoffice/generate-auth-url', tryAndCatch(checkAuth), tryAndCatch(async (req, res) => {

        let parameters = await Joi.validate(req.body, {
            siret: Joi.string().required(),
            raison_sociale: Joi.string().required(),
            courriel: Joi.string().email().required(),
            region: Joi.string().required(),
        }, { abortEarly: false });


        let organisme = await collection.findOne({ 'meta.siretAsString': parameters.siret });

        if (!organisme) {
            organisme = await buildAccount(parameters);
            await collection.insert(organisme);
        }

        let token = await auth.buildJWT('backoffice', {
            sub: organisme.meta.siretAsString,
            profile: 'organisme',
            id: organisme._id,
            raisonSociale: organisme.raisonSociale,
        });

        res.json({
            url: `${configuration.app.public_hostname}/admin?action=loginWithAccessToken&access_token=${token.access_token}`,
            meta: {
                organisme: {
                    siret: organisme.meta.siretAsString,
                    raison_sociale: organisme.raisonSociale,
                    code_region: organisme.codeRegion,
                },
            }
        });
    }));

    return router;
};
