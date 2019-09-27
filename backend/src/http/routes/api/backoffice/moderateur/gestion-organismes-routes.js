const express = require('express');
const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const { IdNotFoundError } = require('../../../../../common/errors');
const { tryAndCatch, getRemoteAddress, sendArrayAsJsonStream } = require('../../../routes-utils');
const getOrganismeEmail = require('../../../../../common/utils/getOrganismeEmail');
const { transformObject, encodeStream } = require('../../../../../common/utils/stream-utils');

module.exports = ({ db, configuration, mailing, middlewares, logger }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let { sendOrganisationAccountEmail, sendForgottenPasswordEmail } = mailing;
    let itemsPerPage = configuration.api.pagination;

    const convertOrganismeToDTO = organisme => {
        organisme.status = organisme.passwordHash ? 'active' : 'inactive';
        return _.omit(organisme, ['passwordHash', 'token']);
    };

    const saveEvent = (id, type, source) => {
        db.collection('events').insertOne({ organisationId: id, date: new Date(), type: type, source: source });
    };

    router.get('/backoffice/moderateur/organismes', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { status, search, page } = await Joi.validate(req.query, {
            status: Joi.string().allow(['all', 'active', 'inactive']).default('all'),
            search: Joi.string(),
            page: Joi.number().min(0).default(0),
        }, { abortEarly: false });

        let cursor = db.collection('accounts')
        .find({
            profile: 'organisme',
            codeRegion: codeRegion,
            ...(search ? {
                $or: [
                    { 'meta.siretAsString': search },
                    { 'courriel': search },
                    { 'raisonSociale': new RegExp(search, 'i') }]
            } : {}),
            ...(status === 'all' ? {} : { passwordHash: { $exists: status === 'active' } }),
        })
        //.sort({ updateDate: -1 })
        .skip((page || 0) * itemsPerPage)
        .limit(itemsPerPage);

        let [total, itemsOnThisPage] = await Promise.all([
            cursor.count(),
            cursor.count(true),
        ]);

        let stream = cursor.transformStream({
            transform: o => convertOrganismeToDTO(o),
        });

        return sendArrayAsJsonStream(stream, res, {
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

    router.get('/backoffice/moderateur/export/organismes.csv', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { status } = await Joi.validate(req.query, {
            status: Joi.string().allow(['all', 'active', 'inactive']).default('all'),
            token: Joi.string().required(),
        }, { abortEarly: false });

        let stream = await db.collection('accounts').find({
            profile: 'organisme',
            codeRegion: codeRegion,
            ...(status === 'all' ? {} : { passwordHash: { $exists: status === 'active' } }),
        }, { token: 0 }).stream();
        let lines = 'Siret;Nom;Email;Nombre d\'Avis;Kairos\n';

        res.setHeader('Content-disposition', 'attachment; filename=organismes.csv');
        res.setHeader('Content-Type', 'text/csv; charset=iso-8859-1');
        res.write(lines);

        let handleError = e => {
            logger.error('An error occurred', e);
            res.status(500);
            stream.push(Boom.boomify(e).output.payload);
        };

        stream
        .on('error', handleError)
        .pipe(transformObject(async organisme => {

            let isKairos = organisme => {
                let kairos = organisme.sources.find(s => s === 'kairos');
                return kairos === 'kairos' ? 'oui' : 'non';
            };

            let kairos = isKairos(organisme);
            let email = getOrganismeEmail(organisme);

            return organisme.meta.siretAsString + ';' +
                organisme.raisonSociale + ';' +
                email + ';' +
                organisme.score.nb_avis + ';' +
                kairos + '\n';

        }))
        .pipe(encodeStream('UTF-16BE'))
        .pipe(res)
        .on('end', () => res.end());

    }));

    router.put('/backoffice/moderateur/organismes/:id/updateEditedCourriel', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let { id } = await Joi.validate(req.params, { id: Joi.number().integer().required() }, { abortEarly: false });
        let { courriel } = await Joi.validate(req.body, { courriel: Joi.string().email().required() }, { abortEarly: false });

        let result = await db.collection('accounts').findOneAndUpdate(
            { _id: id },
            { $set: { editedCourriel: courriel } },
            { returnOriginal: false }
        );

        if (!result.value) {
            throw new IdNotFoundError(`Avis with identifier ${id} not found`);
        }

        saveEvent(id, 'editEmail', {
            app: 'moderation',
            profile: 'moderateur',
            user: 'admin',
            ip: getRemoteAddress(req)
        });
        return res.status(201).send(result.value);
    }));

    router.put('/backoffice/moderateur/organismes/:id/removeEditedCourriel', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let { id } = await Joi.validate(req.params, { id: Joi.number().integer().required() }, { abortEarly: false });

        let organisme = await db.collection('accounts').findOne({ _id: id });
        if (organisme) {
            await db.collection('accounts').updateOne({ _id: id }, { $unset: { editedCourriel: '' } });
            saveEvent(id, 'deleteEmail', {
                app: 'moderation',
                profile: 'moderateur',
                user: 'admin',
                ip: getRemoteAddress(req)
            });
            res.status(200).send({ 'status': 'OK' });
        } else {
            throw Boom.notFound('Not found');
        }
    }));

    router.post('/backoffice/moderateur/organismes/:id/resendEmailAccount', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let { id } = await Joi.validate(req.params, { id: Joi.number().integer().required() }, { abortEarly: false });

        let organisme = await db.collection('accounts').findOne({ _id: id, profile: 'organisme' });
        if (organisme) {
            if (organisme.passwordHash) {
                await sendForgottenPasswordEmail(organisme._id, getOrganismeEmail(organisme), organisme.codeRegion);
            } else {
                await sendOrganisationAccountEmail(organisme, { ip: getRemoteAddress(req) });
            }

            res.status(200).send({ 'status': 'OK' });

        } else {
            throw Boom.notFound('Not found');
        }
    }));

    return router;
};
