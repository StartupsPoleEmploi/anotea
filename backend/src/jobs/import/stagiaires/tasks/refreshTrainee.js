const fs = require('fs');
const _ = require('lodash');
const parse = require('csv-parse');
const validateTrainee = require('./utils/validateTrainee');
const { getDifferences, flattenKeys } = require('../../../../common/utils/object-utils');
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

    let getNewMeta = (previous, current) => {

        let differences = getDifferences(previous, current);
        if (_.isEmpty(differences)) {
            return previous.meta;
        }

        let meta = _.cloneDeep(previous.meta) || {};
        meta.history = meta.history || [];
        meta.history.unshift({
            date: new Date(),
            ...differences,
        });
        return meta;
    };

    let refreshStagiaire = async (previous, trainee) => {
        let merged = _.merge({},
            previous,
            {
                trainee: {
                    dnIndividuNational: trainee.trainee.dnIndividuNational,
                    idLocal: trainee.trainee.idLocal,
                },
                training: {
                    formacodes: trainee.training.formacodes,
                    certifInfos: trainee.training.certifInfos,
                    organisation: trainee.training.organisation,
                    place: {
                        inseeCode: trainee.training.place.inseeCode,
                    },
                },
            },
        );

        let meta = getNewMeta(previous, merged);
        let res = await db.collection('trainee').updateOne({ token: previous.token }, {
            $set: {
                'trainee.dnIndividuNational': merged.trainee.dnIndividuNational,
                'trainee.idLocal': merged.trainee.idLocal,
                'training.formacodes': merged.training.formacodes,
                'training.certifInfos': merged.training.certifInfos,
                'training.organisation': merged.training.organisation,
                ...(merged.training.place.inseeCode ? { 'training.place.inseeCode': merged.training.place.inseeCode } : {}),
                ...(meta ? { meta } : {}),
            }
        });
        stats.trainee += getNbModifiedDocuments(res);
    };

    let refreshAvis = async (previous, trainee) => {
        let merged = _.merge({},
            previous,
            {
                training: {
                    formacodes: trainee.training.formacodes,
                    certifInfos: trainee.training.certifInfos,
                    organisation: trainee.training.organisation,
                    place: {
                        inseeCode: trainee.training.place.inseeCode,
                    },
                },
            },
        );

        let meta = getNewMeta(previous, merged);
        let res = await db.collection('comment').updateOne({ token: previous.token }, {
            $set: {
                'training.formacodes': merged.training.formacodes,
                'training.certifInfos': merged.training.certifInfos,
                'training.organisation': merged.training.organisation,
                ...(merged.training.place.inseeCode ? { 'training.place.inseeCode': merged.training.place.inseeCode } : {}),
                ...(meta ? { meta } : {}),
            }
        });
        stats.comment += getNbModifiedDocuments(res);
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
