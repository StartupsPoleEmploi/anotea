const express = require('express');
const Joi = require('joi');
const { tryAndCatch, sendJsonStream } = require('../../utils/routes-utils');
const { catalogueSearchSchema, catalogueFindSchema, catalogueFindAvisSchema } = require('./utils/validators');
const createReconciliation = require('./reconcilication/reconciliation');

module.exports = ({ db, middlewares }) => {

    let router = express.Router();// eslint-disable-line new-cap
    let { createHMACAuthMiddleware } = middlewares;
    let checkAuth = createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: true });
    let reconciliation = createReconciliation(db);

    router.get('/api/v1/formations', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = Joi.attempt(req.query, catalogueSearchSchema, '', { abortEarly: false });


        let stream = await reconciliation.findFormationsAsStream(parameters);

        return sendJsonStream(stream, res);
    }));

    router.get('/api/v1/formations/:id', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = Joi.attempt(Object.assign({}, req.query, req.params), catalogueFindSchema, '', { abortEarly: false });


        let dto = await reconciliation.getFormation(parameters, {
            jsonLd: req.headers.accept === 'application/ld+json'
        });

        return res.json(dto);
    }));

    router.get('/api/v1/formations/:id/avis', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = Joi.attempt(Object.assign({}, req.query, req.params), catalogueFindAvisSchema, '', { abortEarly: false });

        let avis = await reconciliation.getAvisForFormation(parameters);

        return res.json(avis);
    }));

    return router;
};
