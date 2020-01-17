const fs = require('fs');
const _ = require('lodash');
const parse = require('csv-parse');
const validateStagiaire = require('./utils/validateStagiaire');
const { getDifferences, flattenKeys } = require('../../../../core/utils/object-utils');
const { writeObject, pipeline, ignoreFirstLine, transformObject } = require('../../../../core/utils/stream-utils');
const { sanitizeCsvLine } = require('./utils/utils');
const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async (db, logger, file, handler) => {

    let stats = {
        stagiaires: 0,
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

    let refreshStagiaire = async (previous, stagiaire) => {
        let merged = _.merge({},
            previous,
            {
                personal: {
                    dnIndividuNational: stagiaire.personal.dnIndividuNational,
                    idLocal: stagiaire.personal.idLocal,
                },
                training: {
                    formacodes: stagiaire.training.formacodes,
                    certifInfos: stagiaire.training.certifInfos,
                    organisation: stagiaire.training.organisation,
                    place: {
                        inseeCode: stagiaire.training.place.inseeCode,
                    },
                },
            },
        );

        let meta = getNewMeta(previous, merged);
        let res = await db.collection('stagiaires').updateOne({ token: previous.token }, {
            $set: {
                'personal.dnIndividuNational': merged.personal.dnIndividuNational,
                'personal.idLocal': merged.personal.idLocal,
                'training.formacodes': merged.training.formacodes,
                'training.certifInfos': merged.training.certifInfos,
                'training.organisation': merged.training.organisation,
                ...(merged.training.place.inseeCode ? { 'training.place.inseeCode': merged.training.place.inseeCode } : {}),
                ...(meta ? { meta } : {}),
            }
        });
        stats.stagiaires += getNbModifiedDocuments(res);
    };

    let refreshAvis = async (previous, stagiaire) => {
        let merged = _.merge({},
            previous,
            {
                training: {
                    formacodes: stagiaire.training.formacodes,
                    certifInfos: stagiaire.training.certifInfos,
                    organisation: stagiaire.training.organisation,
                    place: {
                        inseeCode: stagiaire.training.place.inseeCode,
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
                let stagiaire = await handler.buildStagiaire(record, { name: 'refresh', date: new Date() });
                await validateStagiaire(stagiaire);

                if (!handler.shouldBeImported(stagiaire)) {
                    return false;
                }

                let key = flattenKeys(handler.getKey(stagiaire));
                let previous = await db.collection('stagiaires').findOne(key);
                if (!previous) {
                    return false;
                }

                await Promise.all([
                    refreshStagiaire(previous, stagiaire),
                    db.collection('comment').findOne({ token: previous.token })
                    .then(comment => {
                        return comment ? refreshAvis(comment, stagiaire) : false;
                    }),
                ]);

            } catch (e) {
                stats.invalid++;
                logger.error(`Stagiaire cannot be handled`, record, e);
            }

        }, { parallel: 100 }),
    ]);

    return stats;
};
