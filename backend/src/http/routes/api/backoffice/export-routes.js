const express = require('express');
const moment = require('moment/moment');
const s = require('string');
const Boom = require('boom');
const { tryAndCatch } = require('../../routes-utils');
const { encodeStream } = require('iconv-lite/lib/index');
const { transformObject } = require('../../../../common/utils/stream-utils');

module.exports = ({ db, middlewares, logger }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const POLE_EMPLOI = '4';
    let { createJWTAuthMiddleware } = middlewares;
    const checkAuth = createJWTAuthMiddleware('backoffice');

    // TODO : don't generate on the fly (use cron for every region : see /jobs/export/region)
    router.get('/backoffice/export/avis.csv', checkAuth, tryAndCatch(async (req, res) => {

        let query = {};

        if (req.query.status === 'reported') {
            query['reported'] = true;
        } else if (req.query.status === 'commented') {
            query['published'] = true;
            query['$and'] = [
                { 'comment': { $ne: null } },
                {
                    $or: [
                        { 'comment.title': { $ne: '' } },
                        { 'comment.text': { $ne: '' } }
                    ]
                }
            ];
        } else if (req.query.status === 'rejected') {
            query['rejected'] = true;
        }

        if (req.query.filter === 'region') {
            query['training.infoRegion'] = { $ne: null };
        }

        if (req.user.profile === 'organisme') {
            query['training.organisation.siret'] = req.user.siret;
        } else if (req.user.profile === 'financeur') {
            query['codeRegion'] = req.user.codeRegion;
            if (req.user.codeFinanceur !== POLE_EMPLOI) {
                query['training.codeFinanceur'] = { '$elemMatch': { '$eq': req.user.codeFinanceur } };
            } else if (req.user.codeFinanceur === POLE_EMPLOI && req.query.codeFinanceur) {
                query['training.codeFinanceur'] = { '$elemMatch': { '$eq': req.query.codeFinanceur } };
            }

            if (req.query.siret) {
                query['training.organisation.siret'] = { '$regex': `${req.query.siret}` };
            }
            if (req.query.postalCode) {
                query['training.place.postalCode'] = req.query.postalCode;
            }
            if (req.query.trainingId) {
                query['training.idFormation'] = req.query.trainingId;
            }
        }

        let stream = await db.collection('comment').find(query, { token: 0 }).stream();
        let lines = 'id;note accueil;note contenu formation;note equipe formateurs;note matériel;note accompagnement;note global;pseudo;titre;commentaire;campagne;date;accord;id formation; titre formation;date début;date de fin prévue;id organisme; siret organisme;libellé organisme;nom organisme;code postal;ville;id certif info;libellé certifInfo;id session;formacode;AES reçu;référencement;id session aude formation;numéro d\'action;numéro de session;code financeur\n';

        if (req.user.codeFinanceur === POLE_EMPLOI || req.query.status === 'rejected') {
            let array = lines.split(';');
            array.splice(10, 0, 'qualification');
            lines = array.join(';');
        }

        res.setHeader('Content-disposition', 'attachment; filename=avis.csv');
        res.setHeader('Content-Type', 'text/csv; charset=iso-8859-1');
        res.write(lines);

        let handleError = e => {
            logger.error('An error occurred', e);
            res.status(500);
            stream.push(Boom.boomify(e).output.payload);
        };

        stream
        .on('error', handleError)
        .pipe(transformObject(async comment => {

            let qualification = '';

            if (req.query.status === 'rejected') {
                qualification = ';' + (comment.rejectReason !== undefined ? comment.rejectReason : '');
            } else if (req.user.codeFinanceur === POLE_EMPLOI) {
                qualification = ';';
                if (comment.published) {
                    qualification += comment.qualification !== undefined ? comment.qualification : '';
                } else if (comment.rejected) {
                    qualification += comment.rejectReason !== undefined ? comment.rejectReason : '';
                }
            }

            if (comment.comment !== undefined && comment.comment !== null) {
                comment.comment.pseudo = (comment.comment.pseudo !== undefined) ? comment.comment.pseudo.replace(/\r?\n|\r/g, ' ') : '';
                comment.comment.title = (comment.comment.title !== undefined) ? comment.comment.title.replace(/\r?\n|\r/g, ' ') : '';
                comment.comment.text = (comment.comment.text !== undefined) ? comment.comment.text.replace(/\r?\n|\r/g, ' ') : '';
            }

            return comment._id + ';' +
                (comment.rates !== undefined ? comment.rates.accueil : '') + ';' +
                (comment.rates !== undefined ? comment.rates.contenu_formation : '') + ';' +
                (comment.rates !== undefined ? comment.rates.equipe_formateurs : '') + ';' +
                (comment.rates !== undefined ? comment.rates.moyen_materiel : '') + ';' +
                (comment.rates !== undefined ? comment.rates.accompagnement : '') + ';' +
                (comment.rates !== undefined ? comment.rates.global : '') + ';' +
                (comment.comment !== undefined && comment.comment !== null ? '"' + s(comment.comment.pseudo).replaceAll(';', '').replaceAll('"', '').s + '"' : '') + ';' +
                (comment.comment !== undefined && comment.comment !== null ? '"' + s(comment.comment.title).replaceAll(';', '').replaceAll('"', '').s + '"' : '') + ';' +
                (comment.comment !== undefined && comment.comment !== null ? '"' + s(comment.comment.text).replaceAll(';', '').replaceAll('"', '').s + '"' : '') +
                qualification + ';' +
                comment.campaign + ';' +
                comment.date + ';' +
                comment.accord + ';' +
                comment.training.idFormation + ';' +
                comment.training.title + ';' +
                moment(comment.training.startDate).format('DD/MM/YYYY') + ';' +
                moment(comment.training.scheduledEndDate).format('DD/MM/YYYY') + ';' +
                comment.training.organisation.id + ';' +
                '"' + comment.training.organisation.siret + '";' +
                comment.training.organisation.label + ';' +
                comment.training.organisation.name + ';' +
                comment.training.place.postalCode + ';' +
                comment.training.place.city + ';' +
                '\'' + comment.training.certifInfo.id + '\';' +
                comment.training.certifInfo.label + ';' +
                comment.training.idSession + ';' +
                comment.training.formacode + ';' +
                comment.training.aesRecu + ';' +
                comment.training.referencement + ';' +
                comment.training.idSessionAudeFormation + ';' +
                (comment.infoCarif !== undefined ? comment.infoCarif.numeroAction : '') + ';' +
                (comment.infoCarif !== undefined ? comment.infoCarif.numeroSession : '') + ';' +
                comment.training.codeFinanceur + '\n';
        }))
        .pipe(encodeStream('UTF-16BE'))
        .pipe(res)
        .on('end', () => res.end());
    }));

    return router;
};
