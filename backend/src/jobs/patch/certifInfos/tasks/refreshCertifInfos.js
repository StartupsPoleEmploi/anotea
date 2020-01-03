const fs = require('fs');
const _ = require('lodash');
const { ignoreFirstLine, pipeline, writeObject } = require('../../../../core/utils/stream-utils');
const { getDifferences, mergeDeep } = require('../../../../core/utils/object-utils');
const { getNbModifiedDocuments } = require('../../../job-utils');
const parse = require('csv-parse');

let loadCertifinfos = async file => {
    const ETAT_ERRONE = '2';

    let handleChaining = mapping => {

        let codesReducer = codes => {
            return codes.reduce((acc, code) => {
                let newCodes = mapping[code];
                if (newCodes) {
                    if (newCodes.filter(c => mapping[c]).length > 0) {
                        return [...acc, ...codesReducer(newCodes)];
                    }
                    return [...acc, ...newCodes];
                }
                return [...acc, code];
            }, []);
        };

        return Object.keys(mapping).reduce((acc, code) => {
            return {
                ...acc,
                [code]: codesReducer(mapping[code]),
            };
        }, {});
    };

    let mapping = {};
    await pipeline([
        fs.createReadStream(file),
        parse({
            delimiter: ';',
            quote: '',
            relax_column_count: true,
            columns: [
                'cer3_code',
                'cer3_libelle',
                'cer3_etat',
                'cer3_codenew',
                'cer3_libellenew',
                'cer3_etat',
            ],
        }),
        ignoreFirstLine(),
        writeObject(data => {

            if (data.cer3_etat === ETAT_ERRONE) {
                return; //etat erroné
            }

            let codenew = data.cer3_codenew;
            if (mapping[data.cer3_code]) {
                mapping[data.cer3_code].push(codenew);
            } else {
                mapping[data.cer3_code] = [codenew];
            }
        }),
    ]);

    return handleChaining(mapping);
};

module.exports = async (db, logger, file) => {

    const patch = async (collectionName, certifications) => {

        let stats = {
            updated: 0,
            invalid: 0,
            total: 0,
        };

        let getNewCertifInfos = doc => {
            return _.uniq(doc.training.certifInfos.reduce((acc, code) => {
                let codes = certifications[code] ? [...certifications[code], code] : [code];
                return [...acc, ...codes];
            }, []));
        };

        let getNewMeta = (previous, next) => {

            let differences = getDifferences(previous, next);
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

        let cursor = db.collection(collectionName).find({});
        while (await cursor.hasNext()) {
            try {
                stats.total++;
                let previous = await cursor.next();
                let merged = mergeDeep({},
                    previous,
                    {
                        training: {
                            certifInfos: getNewCertifInfos(previous),
                        },
                    },
                );
                let meta = getNewMeta(previous, merged);

                if (previous.training.certifInfos.find(code => certifications[code])) {
                    let results = await db.collection(collectionName).updateOne({ _id: previous._id }, {
                        $set: {
                            'training.certifInfos': merged.training.certifInfos,
                            ...(meta ? { meta } : {}),
                        }
                    });

                    if (getNbModifiedDocuments(results) > 0) {
                        stats.updated++;
                    }
                }
            } catch (e) {
                stats.invalid++;
                logger.error(`Stagiaire cannot be patched`, e);
            }
        }

        return stats;
    };

    let certifInfos = await loadCertifinfos(file);
    let [trainee, comment] = await Promise.all([
        patch('trainee', certifInfos),
        patch('comment', certifInfos),
    ]);

    return { trainee, comment };
};

