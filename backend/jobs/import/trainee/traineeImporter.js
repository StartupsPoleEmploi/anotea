const path = require('path');
const fs = require('fs');
const parse = require('csv-parse');
const md5File = require('md5-file/promise');
const moment = require('moment');
const readline = require('readline');
const _ = require('underscore');
const colors = require('colors/safe');
const validate = require('./traineeValidator');
const { handleBackPressure } = require('../../utils');
const createMailer = require('../../../components/mailer');

const getCampaignName = file => {
    const filename = path.basename(file);
    return filename.substring(0, filename.length - 4);
};

module.exports = (db, logger, configuration, source) => {

    const BAD_FORMAT_MESSAGE = 'File is not valid due to bad format';
    const mailer = createMailer(db, logger, configuration);

    const { findDepartementsForRegion } = require('../../../components/regions')(db);

    const sendErrorMail = (file, reason, callback) => {
        return mailer.sendMalformedImport({
            filename: path.basename(file),
            date: moment().format('DD/MM/YYYY'),
            reason: reason,
            source: source
        }, callback, callback);
    };

    const isHeaderValid = (input, handler) => {
        const headers = input.split(handler.csvOptions.delimiter);
        if (!_.isEqual(headers, handler.csvOptions.columns)) {
            logger.error(`${BAD_FORMAT_MESSAGE}. Differences : ${colors.green(`+${_.difference(headers, handler.csvOptions.columns)}`)} ${colors.red(`-${_.difference(handler.csvOptions.columns, headers)}`)}`);
            return false;
        } else {
            return true;
        }
    };

    const isRowValid = (input, handler, campaign, deptList) => {

        if (lines.filter(line => _.isEqual(line, input)).length > 0) {
            logger.error('File is not valid due to duplicates found');
            return Promise.reject(false);
        }

        return new Promise((resolve, reject) => {
            const parser = parse(handler.csvOptions);
            parser.write(input);
            parser.end();
            parser.on('readable', async () => {
                let record = parser.read();
                if (deptList.includes(record.departement)) {
                    let trainee;
                    try {
                        trainee = await handler.buildTrainee(record, campaign);
                        if (handler.shouldBeImported(trainee)) {
                            try {
                                await validate(trainee);
                                resolve();
                            } catch (e) {
                                logger.error(BAD_FORMAT_MESSAGE);
                                reject();
                            }
                        } else {
                            reject();
                        }
                        resolve();
                    } catch (e) {
                        reject();
                    }
                    resolve();
                } else {
                    reject();
                }
            });
        });
    };


    const validateFile = async (campaign, file, handler, filters) => {
        let lines = [];
        let line = 0;
        let errorFound = false;
        const isEmptyLine = input => input === ';;;;;;;;;;;;;;;;';
        let deptList = filters.codeRegion ? await findDepartementsForRegion(filters.codeRegion) : null;

        return new Promise((resolve, reject) => {
            readline.createInterface({ input: fs.createReadStream(file) })
            .on('line', async input => {

                lines.push(input);

                if (!errorFound && !isEmptyLine(input)) {
                    if (line++ === 0 && !isHeaderValid(input, handler)) {
                        return reject('du format non conforme');
                    }

                    if (await isRowValid(input, handler, campaign, deptList)) {
                        return reject('du format non conforme');
                    }

                    if (await checkIfDuplicates(input, lines)) {
                        return reject('de la présence de doublons');
                    }
                }
            }).on('close', () => resolve());
        });
    };

    return {
        importTrainee: async (file, handler, dryRun, filters = {}) => {

            let campaign = getCampaignName(file);
            let hash = await md5File(file);

            const shouldBeIgnored = async (trainee, filters) => {
                let notSameRegion = filters.codeRegion && filters.codeRegion !== trainee.codeRegion;
                let beforeSessionDate = filters.startDate && trainee.training.scheduledEndDate <= filters.startDate;
                let notSameCodeFinancer = filters.includeCodeFinancer &&
                    !trainee.training.codeFinanceur.includes(filters.includeCodeFinancer);
                let codeFinancerExcluded = filters.excludeCodeFinancer &&
                    trainee.training.codeFinanceur.includes(filters.excludeCodeFinancer) &&
                    trainee.training.codeFinanceur.length === 1;

                return notSameRegion || beforeSessionDate || codeFinancerExcluded || notSameCodeFinancer ||
                    !(await handler.shouldBeImported(trainee));
            };

            return new Promise(async (resolve, reject) => {

                if (dryRun === true) {
                    try {
                        await validateFile(campaign, file, handler);
                    } catch (e) {
                        sendErrorMail(file, e, () => reject(e));
                    }

                } else if (await db.collection('importTrainee').findOne({ hash })) {
                    reject(new Error(`CSV file ${file} already imported`));
                } else {

                    logger.info(`Trainee import ${handler.name}/${campaign}...`);

                    let results = {
                        total: 0,
                        imported: 0,
                        ignored: 0,
                        invalid: 0,
                    };

                    fs.createReadStream(file)
                    .pipe(parse(handler.csvOptions))
                    .pipe(handleBackPressure(async data => {
                        try {
                            let trainee = await handler.buildTrainee(data, campaign);

                            if (await shouldBeIgnored(trainee, filters)) {
                                return { status: 'ignored', trainee };
                            } else {
                                await validate(trainee);
                                await db.collection('trainee').save(trainee);
                                return { status: 'imported', trainee };
                            }
                        } catch (e) {
                            return { status: 'invalid', trainee: data, error: e };
                        }
                    }))
                    .on('data', ({ trainee, status, error }) => {
                        results.total++;
                        results[status]++;

                        if (status === 'ignored') {
                            logger.debug('Trainee ignored', trainee, {});
                        } else if (status === 'invalid') {
                            logger.error(`Trainee cannot be imported`, trainee, error);
                        } else {
                            logger.debug('New trainee inserted');
                        }
                    })
                    .on('finish', async () => {
                        try {
                            await db.collection('importTrainee').save({
                                hash,
                                campaign,
                                date: new Date(),
                            });

                            return results.invalid === 0 ? resolve(results) : reject(results);

                        } catch (e) {
                            reject(e);
                        }
                    });

                }
            });
        }
    };
};
