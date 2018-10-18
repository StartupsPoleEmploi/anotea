#!/usr/bin/env node
'use strict';

const fs = require('fs');
const _ = require('lodash');
const request = require('superagent');
const Throttle = require('superagent-throttle');
const mongo = require('mongodb');
const configuration = require('config');
const csvWriter = require('csv-write-stream');

const getMongoClient = () => mongo.connect(configuration.mongodb.uri, { useNewUrlParser: true });

process.on('unhandledRejection', r => console.error(r));
process.on('uncaughtException', r => console.error(r));

const main = async () => {

    let client = await getMongoClient();
    let intercarif = client.db().collection('intercarif');
    let throttle = new Throttle({
        active: true,
        rate: 500,
        ratePer: 1000,
        concurrent: 20,
    });

    const writer = csvWriter({
        separator: ';',
    });
    writer.pipe(fs.createWriteStream('export-avis-api-sessions.csv'));

    let sessions = await intercarif.aggregate([
        { $match: { 'actions.lieu_de_formation.coordonnees.adresse.region': '11' } },
        { $project: { 'actions.sessions._attributes.numero': 1 } },
        { $unwind: '$actions' },
        { $group: { _id: { numero: '$actions.sessions._attributes.numero' } } },
        { $unwind: '$_id.numero' },
    ]).toArray();

    let nbSessionsAvecAvis = 0;
    let nbAvis = 0;
    let progress = 0;
    let promises = sessions.map(session => {
        return request
        .get(`http://localhost:8080/api/v1/sessions/${session._id.numero}/avis`)
        .use(throttle.plugin())
        .then(response => {
            let avis = response.body.avis;
            if (avis.length > 0) {
                nbSessionsAvecAvis++;
                nbAvis += avis.length;
            }
            const percentage = Math.round((nbSessionsAvecAvis * 100) / sessions.length);
            let moyenneAvis = Math.round(nbAvis / nbSessionsAvecAvis);
            let status = Math.round((++progress * 100) / sessions.length);
            console.log(`Session avec avis: ${nbSessionsAvecAvis} (soit ${percentage}% ) / Nombre d'avis moyen par session ${moyenneAvis} /  Progress: ${status}% (${progress} sessions)`);
            return response.body;
        })
        .then(results => {

            const sanitize = value => {
                if (_.isEmpty(value)) {
                    return 'NULL';
                }
                return value.replace(/[\n]+/g, ' ').replace(/[\n\r]+/g, ' ').replace(/[;]+/g, ',');
            };

            let formation = results.formation;
            results.avis.forEach(avis => {

                let line = {
                    avis_formation_intitule: sanitize(avis.formation.intitule),
                    avis_formation_formacode: avis.formation.domaine_formation.formacodes.join(','),
                    avis_formation_certifications: avis.formation.certifications.map(c => c.certif_info).join(','),
                    avis_lieu_de_formation_code_postal: avis.formation.action.lieu_de_formation.code_postal,
                    avis_lieu_de_formation_ville: avis.formation.action.lieu_de_formation.ville,
                    avis_organisme_formateur_raison_sociale: sanitize(avis.formation.action.organisme_formateur.raison_sociale),
                    avis_organisme_formateur_siret: avis.formation.action.organisme_formateur.siret,
                    avis_titre: sanitize(avis.commentaire.titre),
                    avis_texte: sanitize(avis.commentaire.texte),
                    avis_date: avis.date,
                    session_formation_numero: formation.numero,
                    session_formation_intitule: formation.intitule,
                    session_formation_formacodes: formation.domaine_formation.formacodes.join(','),
                    session_formation_certifications: formation.certifications.map(c => c.certif_info).join(','),
                    session_lieu_de_formation_code_postal: formation.action.lieu_de_formation.code_postal,
                    session_lieu_de_formation_ville: formation.action.lieu_de_formation.ville,
                    session_organisme_formateur_raison_sociale: formation.action.organisme_formateur.raison_sociale,
                    session_organisme_formateur_siret: formation.action.organisme_formateur.siret,
                };

                writer.write(line);
            });
        });
    });

    Promise.all(promises).then(() => {
        console.log('done');
        writer.end();
        client.close();
    });
};

main();

