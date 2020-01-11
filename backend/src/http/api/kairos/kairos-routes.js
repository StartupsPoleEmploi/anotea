const express = require('express');
const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const _ = require('lodash');
const configuration = require('config');
const YAML = require('yamljs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const { tryAndCatch } = require('../../utils/routes-utils');
const { createOrganismeFomateurDTO } = require('../v1/utils/dto');
const getCodeRegionFromKairosRegionName = require('../../../jobs/organismes/tasks/kairos/getCodeRegionFromKairosRegionName');

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
            return {
                _id: parseInt(data.siret),
                SIRET: parseInt(data.siret),
                raisonSociale: data.raison_sociale,
                courriel: data.courriel,
                courriels: [data.courriel],
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
            url: `${configuration.app.public_hostname}/admin/login?origin=kairos&access_token=${accessToken}`,
            meta: {
                created,
                organisme: createOrganismeFomateurDTO(organisme, { notes_decimales: true }),
            }
        });
    });

    let apiSpecifications = YAML.load(path.join(__dirname, './kairos-swagger.yml'));
    router.use('/api/kairos/doc', swaggerUi.serve, swaggerUi.setup(Object.assign({}, apiSpecifications)));

    router.post('/api/kairos/generate-auth-url', checkAuth, generateAuthUrlRoute);

    router.get('/api/kairos/check-if-organisme-is-eligible', checkAuth, tryAndCatch(async (req, res) => {

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
                organisme: createOrganismeFomateurDTO(organisme, { notes_decimales: true })
            }
        });
    }));

    return router;
};
