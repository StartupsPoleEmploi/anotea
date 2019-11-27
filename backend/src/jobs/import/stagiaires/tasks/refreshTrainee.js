const fs = require('fs');
const _ = require('lodash');
const parse = require('csv-parse');
const validateTrainee = require('./utils/validateTrainee');
const { mergeDeep, isDeepEquals, getDifferences, flattenKeys } = require('../../../../common/utils/object-utils');
const { writeObject, pipeline, ignoreFirstLine, transformObject } = require('../../../../common/utils/stream-utils');
const { sanitizeCsvLine } = require('./utils/utils');
const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async (db, logger, file, handler) => {

    let stats = {
        trainee: 0,
        comment: 0,
        invalid: 0,
        total: 0,
    };

    let addHistory = (doc, differences) => {
        doc.meta = doc.meta || {};
        doc.meta.history = doc.meta.history || [];
        doc.meta.history.unshift({
            date: new Date(),
            ...differences,
        });
    };

    let pickTrainingPropertiesToRefresh = trainee => {
        let training = trainee.training;
        let inseeCode = training.place.inseeCode;
        return {
            formacodes: training.formacodes,
            certifInfos: training.certifInfos,
            organisation: training.organisation,
            ...(_.isEmpty(inseeCode) ? {} : { place: { inseeCode: inseeCode } }),
        };
    };

    let pickTraineePropertiesToRefresh = trainee => {
        return {
            dnIndividuNational: trainee.trainee.dnIndividuNational,
            idLocal: trainee.trainee.idLocal,
        };
    };

    let refreshStagiaire = async (previous, current) => {

        let newTrainee = mergeDeep({},
            previous,
            { training: pickTrainingPropertiesToRefresh(current) },
            { trainee: pickTraineePropertiesToRefresh(current) },
        );

        if (!isDeepEquals(previous, newTrainee)) {
            let differences = getDifferences(previous, newTrainee);
            addHistory(newTrainee, differences);

            let res = await db.collection('trainee').replaceOne({ token: previous.token }, newTrainee);
            stats.trainee += getNbModifiedDocuments(res);
        }
    };

    let refreshAvis = async (previous, currentTrainee) => {

        let newComment = mergeDeep({},
            previous,
            { training: pickTrainingPropertiesToRefresh(currentTrainee) }
        );

        if (!isDeepEquals(previous, newComment)) {
            let differences = getDifferences(previous, newComment);
            addHistory(newComment, differences);

            let res = await db.collection('comment').replaceOne({ token: previous.token }, newComment);
            stats.comment += getNbModifiedDocuments(res);
        }
    };

    await pipeline([
        fs.createReadStream(file),
        parse(handler.csvOptions),
        ignoreFirstLine(),
        transformObject(sanitizeCsvLine),
        writeObject(async record => {
            try {
                stats.total++;
                let trainee = await handler.buildTrainee(record, { name: 'refresh', date: new Date() });
                await validateTrainee(trainee);

                if (!handler.shouldBeImported(trainee)) {
                    return false;
                }

                let key = flattenKeys(handler.getKey(trainee));
                let previous = await db.collection('trainee').findOne(key);
                if (!previous) {
                    return false;
                }

                await Promise.all([
                    refreshStagiaire(previous, trainee),
                    db.collection('comment').findOne({ token: previous.token })
                    .then(comment => {
                        return comment ? refreshAvis(comment, trainee) : false;
                    }),
                ]);

            } catch (e) {
                stats.invalid++;
                logger.error(`Trainee cannot be handled`, record, e);
            }

        }, { parallel: 100 }),
    ]);

    return stats;
};
