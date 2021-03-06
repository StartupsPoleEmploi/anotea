const fs = require('fs');
const _ = require('lodash');
const { ignoreFirstLine, pipeline, writeObject } = require('../../../../core/utils/stream-utils');
const { getDifferences } = require('../../../../core/utils/object-utils');
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
            let res = _.uniq(doc.formation.certifications.map(c => c.certif_info).reduce((acc, code) => {
                let codes = certifications[code] ? [...certifications[code], code] : [code];
                return [...acc, ...codes];
            }, []));

            return _.sortBy(res.map(c => ({ certif_info: c })), ['certif_info']);
        };

        let getNewMeta = (previous, next) => {

            let differences = getDifferences(previous, next);
            if (_.isEmpty(differences)) {
                return previous.meta || {};
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
                let next = _.cloneDeep(previous);
                next.formation.certifications = getNewCertifInfos(previous);

                if (previous.formation.certifications.map(c => c.certif_info).find(code => certifications[code])) {
                    let results = await db.collection(collectionName).updateOne({ _id: previous._id }, {
                        $set: {
                            'formation.certifications': next.formation.certifications,
                            'meta': getNewMeta(previous, next),
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
    let [stagiaires, avis] = await Promise.all([
        patch('stagiaires', certifInfos),
        patch('avis', certifInfos),
    ]);

    return { stagiaires, avis };
};

