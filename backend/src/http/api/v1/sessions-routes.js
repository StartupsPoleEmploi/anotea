const express = require("express");
const Joi = require("joi");
const { tryAndCatch, sendJsonStream } = require("../../utils/routes-utils");
const validators = require("./utils/validators");
const createReconciliation = require("./reconcilication/reconciliation");

module.exports = ({ db, middlewares }) => {

    let router = express.Router();// eslint-disable-line new-cap
    let { createHMACAuthMiddleware } = middlewares;
    let checkAuth = createHMACAuthMiddleware(["esd", "maformation"], { allowNonAuthenticatedRequests: true });
    let reconciliation = createReconciliation(db);

    router.get("/api/v1/sessions", checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            id: validators.arrayOf(Joi.string()),
            numero: validators.arrayOf(Joi.string()),
            region: validators.arrayOf(Joi.string()),
            nb_avis: Joi.number(),
            ...validators.fields(),
            ...validators.pagination(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        let stream = await reconciliation.findSessionsAsStream(parameters, {
            ...(parameters.region ? { "region": { $in: parameters.region } } : {}),
        });

        return sendJsonStream(stream, res);
    }));

    router.get("/api/v1/sessions/:id", checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...validators.fields(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        let dto = await reconciliation.getSession(parameters, {
            jsonLd: req.headers.accept === "application/ld+json"
        });

        return res.json(dto);
    }));

    router.get("/api/v1/sessions/:id/avis", checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...validators.pagination(),
            ...validators.commentaires(),
            ...validators.notesDecimales(),
            ...validators.tri(),
        }, { abortEarly: false });

        let avis = await reconciliation.getAvisForSession(parameters);

        return res.json(avis);
    }));

    return router;
};
