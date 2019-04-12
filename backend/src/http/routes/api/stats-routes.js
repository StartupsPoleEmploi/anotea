const express = require('express');
const moment = require('moment/moment');
const { encodeStream } = require('iconv-lite/lib/index');
const Boom = require('boom');
const { tryAndCatch } = require('../routes-utils');
const { jsonStream, transformObject } = require('../../../common/utils/stream-utils');

module.exports = ({ db, logger, regions, stats }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const { findRegionByCodeRegion } = regions;

    router.get('/stats/sessions.:format', tryAndCatch(async (req, res) => {
        res.json(await stats.computeSessionStats());
    }));

    router.get('/stats/organismes.:format', tryAndCatch(async (req, res) => {
        res.json(await stats.computeOrganismesStats());
    }));

    router.get('/stats/mailing.:format', tryAndCatch(async (req, res) => {

        let data = await stats.computeMailingStats(req.query.codeRegion, req.query.codeFinanceur);
        if (req.params.format === 'json' || !req.params.format) {
            res.send(data);
        } else if (req.params.format === 'csv') {
            res.setHeader('Content-disposition', 'attachment; filename=stats.csv');
            res.setHeader('Content-Type', 'text/csv');
            let lines = 'Nom de la campagne;Date;Mails envoyés;Mails ouverts;Ouvertures de lien;Personnes ayant validé le questionnaire;Autorisations de contact;Commentaires;Commentaires rejetés\n';
            data.forEach(campaignStats => {
                campaignStats.date = moment(campaignStats.date).format('DD/MM/YYYY h:mm');
                let values = [];
                Object.keys(campaignStats).forEach(key => {
                    values.push(campaignStats[key]);
                });
                lines += values.join(';') + '\n';
            });
            res.send(lines);
        } else {
            res.status(404).render('errors/404');
        }
    }));

    router.get('/stats/stagiaires/ventilation.:format', tryAndCatch(async (req, res) => {

        const financeurs = {
            '0': 'Autre',
            '1': 'Code(s) obsolète(s)',
            '10': 'Bénéficiaire de l\'action',
            '11': 'Etat - Ministère chargé de l\'emploi',
            '12': 'Etat - Ministère de l\'éducation nationale',
            '13': 'Etat - Autre',
            '14': 'Fonds européens - Autre',
            '15': 'Collectivité territoriale - Autre',
            '16': 'OPCA',
            '17': 'OPACIF',
            '2': 'Collectivité territoriale - Conseil régional',
            '3': 'Fonds européens - FSE',
            '4': 'Pôle emploi',
            '5': 'Entreprise',
            '6': 'ACSÉ (anciennement FASILD)',
            '7': 'AGEFIPH',
            '8': 'Collectivité territoriale - Conseil général',
            '9': 'Collectivité territoriale - Commune',
        };

        const findLabelByCodeFinanceur = code => financeurs[code];

        let stream = db.collection('trainee').aggregate([
            {
                $group: {
                    _id: {
                        campaign: '$campaign',
                        codeFinanceurs: '$training.codeFinanceur',
                        codeRegion: '$codeRegion',
                    },
                    nbStagiaires: { $sum: 1 },
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        campaign: '$_id.campaign',
                        codeRegion: '$_id.codeRegion',
                        codeFinanceurs: '$_id.codeFinanceurs',
                        nbStagiaires: '$nbStagiaires',
                    }
                }
            },
        ]);

        let handleError = e => {
            logger.error('An error occurred', e);
            res.status(500);
            stream.push(Boom.boomify(e).output.payload);
        };

        if (req.params.format === 'json' || !req.params.format) {

            res.setHeader('Content-Type', 'application/json');
            stream
            .on('error', handleError)
            .pipe(jsonStream())
            .pipe(res);

        } else if (req.params.format === 'csv') {

            res.setHeader('Content-disposition', 'attachment; filename=stats-stagiaires-ventilation.csv');
            res.setHeader('Content-Type', 'text/csv; charset=iso-8859-1');
            res.write(`Campagne;Libelle Region;Code Region;Libelle Financeur;Code Financeur;Nombre de stagiaires\n`);

            stream
            .on('error', handleError)
            .pipe(transformObject(async doc => {
                let { campaign, codeRegion, codeFinanceurs, nbStagiaires } = doc;
                let libelleFinanceurs = codeFinanceurs.map(code => findLabelByCodeFinanceur(code) || 'Inconnu').join(',');
                let libelleRegion = findRegionByCodeRegion(codeRegion).name;
                return `"${campaign}";"${libelleRegion}";="${codeRegion}";"${libelleFinanceurs}";="${codeFinanceurs}";"${nbStagiaires}"\n`;
            }))
            .pipe(encodeStream('UTF-16BE'))
            .pipe(res);
        } else {
            throw Boom.badRequest('Format invalide');
        }
    }));

    return router;
};
