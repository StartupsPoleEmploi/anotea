const { ObjectId } = require('mongodb');
const express = require('express');
const { notFound } = require('@hapi/boom');
const Joi = require('joi');
const _ = require('lodash');
const { IdNotFoundError } = require('../../../core/errors');
const { tryAndCatch, getRemoteAddress, sendArrayAsJsonStream, sendCSVStream } = require('../../utils/routes-utils');
const { idSchema } = require('../../utils/validators-utils');

module.exports = ({ db, configuration, emails, middlewares, logger }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let itemsPerPage = configuration.api.pagination;

    const gestionOrganismeSchema = Joi.object({
        status: Joi.string().allow('all', 'active', 'inactive').default('all'),
        search: Joi.string(),
            page: Joi.number().min(0).default(0),
    });
    const avisSearchSchema = Joi.object({
        status: Joi.string().allow('all', 'active', 'inactive').default('all'),
        search: Joi.string(),
        token: Joi.string().required(),
    });
    const courrielSchema = Joi.object({ courriel: Joi.string().email().required() });

    const saveEvent = (id, type, source) => {
        db.collection('events').insertOne({ organisationId: id, date: new Date(), type: type, source: source });
    };

    const recupererIdOrganisme = idNonModifie => {
        return isNaN(idNonModifie) ? (new ObjectId(idNonModifie)) : parseInt(idNonModifie);
    };

    router.get('/api/backoffice/moderateur/organismes', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { status, search, page } = Joi.attempt(req.query, gestionOrganismeSchema, '', { abortEarly: false });

        const query = {
            profile: 'organisme',
            codeRegion: codeRegion,
            ...(search ? {
                $or: [
                    { 'siret': search },
                    { 'courriel': search },
                    { 'raison_sociale': new RegExp(search, 'i') }]
            } : {}),
            ...(status === 'all' ? {} : { passwordHash: { $exists: status === 'active' } }),
        };

        const itemToSkip = (page || 0) * itemsPerPage;
        let cursor = db.collection('accounts').aggregate([
            { $match: query },
            { 
                $addFields: { 
                    status: { $cond: { if: { $not: "$passwordHash" }, then: "inactive", else: "active" } }
                }
            },
            { 
                $project: { 
                    passwordHash: false, 
                    token: false,
                }
            },
            { $skip: itemToSkip },
            { $limit: itemsPerPage }
        ]);

        const total = await db.collection('accounts').countDocuments(query);
        const itemsOnThisPage = Math.min(total - itemToSkip, itemsPerPage);

        return sendArrayAsJsonStream(cursor.stream(), res, {
            arrayPropertyName: 'organismes',
            arrayWrapper: {
                meta: {
                    pagination: {
                        page,
                        itemsPerPage,
                        itemsOnThisPage,
                        totalItems: total,
                        totalPages: Math.ceil(total / itemsPerPage),
                    },
                }
            }
        });
    }));

    router.get('/api/backoffice/moderateur/export/organismes.csv', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { status, search } = Joi.attempt(req.query, avisSearchSchema, '', { abortEarly: false });

        let stream = await db.collection('accounts').find({
            profile: 'organisme',
            codeRegion: codeRegion,
            ...(search ? {
                $or: [
                    { 'siret': search },
                    { 'courriel': search },
                    { 'raison_sociale': new RegExp(search, 'i') }]
            } : {}),
            ...(status === 'all' ? {} : { passwordHash: { $exists: status === 'active' } }),
        }, {
            projection: { 
                token: false 
            }
        }).stream();

        let isKairos = organisme => {
            let kairos = organisme.sources && organisme.sources.find(s => s === 'kairos');
            return kairos === 'kairos' ? 'oui' : 'non';
        };
        let isResponsable = organisme => organisme.nbAvisResponsablePasFormateurSiretExact > 0;
        let isFormateur = organisme => organisme.score.nb_avis > 0;

        try {
            await sendCSVStream(stream, res, {
                'Siret': organisme => organisme.siret,
                'Nom': organisme => organisme.raison_sociale,
                'Type': organisme => {
                    if (isResponsable(organisme) && isFormateur(organisme)) {
                        return 'Dispensateur et responsable';
                    } else if (isFormateur) {
                        return 'Dispensateur';
                    } else if (isResponsable(organisme)) {
                        return 'Responsable';
                    } else {
                        return `Pas encore d'avis`;
                    }
                },
                'Email': organisme => organisme.courriel,
                'Nombre d\'Avis': organisme => (organisme?.score?.nb_avis ? organisme.score.nb_avis : 0) + (organisme.nbAvisResponsablePasFormateurSiretExact ? organisme.nbAvisResponsablePasFormateurSiretExact : 0),
                'Kairos': organisme => isKairos(organisme),
                'Lieux de formation': organisme => {
                    return organisme.lieux_de_formation.map(l => `${l.adresse.code_postal}/${l.adresse.ville}`).join(',');
                },
            }, { encoding: 'utf8', filename: 'organismes.csv' });
        } catch (e) {
            //FIXME we must handle errors
            logger.error('Unable to send CSV file', e);
        }

    }));

    router.put('/api/backoffice/moderateur/organismes/:id/updateCourriel', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let idNonModifie = Joi.attempt(req.params, idSchema, '', { abortEarly: false }).id;
                
        let bonId = recupererIdOrganisme(idNonModifie);

        let organisme = await db.collection('accounts').findOne({
            _id: bonId
        });
        
        let { courriel } = Joi.attempt(req.body, courrielSchema, '', { abortEarly: false });

        let alreadyExists = !!organisme.courriels.find(v => v.courriel === courriel);

        let result = await db.collection('accounts').findOneAndUpdate(
            { _id: organisme._id },
            {
                $set: { courriel },
                ...(alreadyExists ? {} : {
                    $addToSet: {
                        courriels: { courriel, source: 'anotea' },
                    }
                }),
            },
            { returnDocument: "after" }
        );

        if (!result) {
            throw new IdNotFoundError(`Avis with identifier ${organisme._id} not found`);
        }

        saveEvent(organisme._id, 'editEmail', {
            app: 'moderation',
            profile: 'moderateur',
            user: 'admin',
            ip: getRemoteAddress(req)
        });

        return res.status(201).send(await db.collection('accounts').findOne({ _id: organisme._id },
            {
                projection: {
                    profile: true,
                    codeRegion: true,
                    siret: true,
                    courriel: true,
                    courriels: true,
                    raison_sociale: true,
                }
            }
        ));
    }));

    router.post('/api/backoffice/moderateur/organismes/:id/resendEmailAccount', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let idNonModifie = Joi.attempt(req.params, idSchema, '', { abortEarly: false }).id;
            
        let bonId = await recupererIdOrganisme(idNonModifie);

        let organisme = await db.collection('accounts').findOne({
            _id: bonId,
            profile: 'organisme',
        });
        
        if (organisme) {
            let templateName = organisme.passwordHash ? 'forgottenPasswordEmail' : 'activationCompteEmail';
            let message = emails.getEmailMessageByTemplateName(templateName);
            await message.send(organisme);

            return res.json({ 'status': 'OK' });

        } else {
            throw notFound('Not found');
        }
    }));

    return router;
};
