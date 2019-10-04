const fs = require('fs');
const _ = require('lodash');
const parse = require('csv-parse');
const { mergeDeep, isDeepEquals, getDifferences } = require('../../../../common/utils/object-utils');
const { writeObject, pipeline, ignoreFirstLine, transformObject } = require('../../../../common/utils/stream-utils');
const { sanitizeCsvLine } = require('./utils/utils');

module.exports = async (db, logger, file, handler) => {

    let stats = {
        trainee: 0,
        comment: 0,
        invalid: 0,
        total: 0,
    };

    let refreshStagiaire = async (trainee, newValues) => {

        let newTrainee = mergeDeep({}, trainee, newValues);
        if (!isDeepEquals(trainee, newTrainee)) {
            newTrainee = mergeDeep(newTrainee, {
                meta: {
                    refreshed: [getDifferences(trainee, newTrainee)]
                }
            });

            let res = await db.collection('trainee').replaceOne({ token: trainee.token }, newTrainee);
            stats.trainee += res.result.nModified;
        }
    };

    let refreshAvis = async (token, newValues) => {

        let comment = await db.collection('comment').findOne({ token });
        if (!comment) {
            return;
        }

        let newComment = mergeDeep({}, comment, newValues);
        if (!isDeepEquals(comment, newComment)) {
            newComment = mergeDeep(newComment, {
                meta: {
                    refreshed: [getDifferences(comment, newComment)]
                }
            });

            let res = await db.collection('comment').replaceOne({ token }, newComment);
            stats.comment += res.result.nModified;
        }
    };

    await pipeline([
        fs.createReadStream(file),
        parse(handler.csvOptions),
        ignoreFirstLine(),
        transformObject(sanitizeCsvLine),
        writeObject(async record => {

            let trainee = await db.collection('trainee').findOne({
                'trainee.email': record['c_adresseemail'].toLowerCase(),
                'training.idSession': record['dn_session_id'],
                'training.scheduledEndDate': new Date(record['dd_datefinmodule'] + 'Z'),
            });

            if (!trainee) {
                return Promise.resolve();
            }

            stats.total++;
            let inseeCode = record['dc_insee_lieuformation'];
            let newValues = {
                training: {
                    organisation: {
                        id: record['dc_organisme_id'],
                        siret: record['dc_siret'],
                        label: record['dc_lblorganisme'],
                        name: record['dc_raisonsociale'],
                    },
                    ...(_.isEmpty(inseeCode) ? {} : { place: { inseeCode } }),
                }
            };
            return Promise.all([
                refreshStagiaire(trainee, newValues),
                refreshAvis(trainee.token, newValues),
            ])
            .catch(e => {
                stats.invalid++;
                logger.error(e);
            });
        }, { parallel: 100 }),
    ]);

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
