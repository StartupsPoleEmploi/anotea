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
    const DUPLICATE_MESSAGE = 'File is not valid due to duplicates found';

    const mailer = createMailer(db, logger, configuration);

    const sendErrorMail = (file, reason, callback) => {
        return mailer.sendMalformedImport({
            filename: path.basename(file),
            date: moment().format('DD/MM/YYYY'),
            reason: reason,
            source: source
        }, callback, callback);
    };

    const checkIfHeaderIsValid = (input, handler) => {
        const cols = input.split(handler.csvOptions.delimiter);
        if (!_.isEqual(cols, handler.csvOptions.columns)) {
            logger.error(`${BAD_FORMAT_MESSAGE}. Differences : ${colors.green(`+${_.difference(cols, handler.csvOptions.columns)}`)} ${colors.red(`-${_.difference(handler.csvOptions.columns, cols)}`)}`);
            return false;
        } else {
            return true;
        }
    };

    const checkIfDuplicates = (input, lines) => {
        const duplicates = lines.filter(line => _.isEqual(line, input));
        if (duplicates.length > 0) {
            logger.error(DUPLICATE_MESSAGE);
            return true;
        } else {
            lines.push(input);
            return false;
        }
    };

    const checkValidation = (input, handler, campaign) => {
        const parser = parse(handler.csvOptions);
        parser.write(input);
        parser.end();
        parser.on('readable', async () => {
            let record = parser.read();
            let trainee;
            try {
                trainee = await handler.buildTrainee(record, campaign);
                if (handler.shouldBeImported(trainee)) {
                    try {
                        await validate(trainee);
                        return true;
                    } catch (e) {
                        logger.error(BAD_FORMAT_MESSAGE);
                        return false;
                    }
                } else {
                    return true;
                }
            } catch (e) {
                return false;
            }
        });
    };

    const isEmptyLine = input => {
        return input === ';;;;;;;;;;;;;;;;';
    };

    const doImport = (campaign, file, handler, hash, resolve, reject) => {
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

                if (!handler.shouldBeImported(trainee)) {
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
    };

    return {
        importTrainee: async (file, handler, dryRun) => {
            let campaign = getCampaignName(file);

            let hash;
            try {
                hash = await md5File(file);
            } catch (e) {
                let promise = new Promise((resolve, reject) => {
                    logger.error(`CSV file ${file} not found`);
                    sendErrorMail(file, 'de l\'absence du fichier sur le serveur FTP', () => {
                        reject(`${file} is not valid.`);
                    });
                });
                return promise;
            }
            logger.info(`Trainee import ${handler.name}/${campaign}`);

            let lines = [];

            const finish = (error, reject, resolve) => {
                if (error) {
                    reject(`${file} is not valid.`);
                } else {
                    resolve(`${file} is valid.`);
                }
            };

            return new Promise(async (resolve, reject) => {
                if (dryRun === true) {
                    let line = 0;
                    let error = false;
                    let stream = readline.createInterface({ input: fs.createReadStream(file) });
                    stream.on('line', async input => {
                        if (!error && !isEmptyLine(input)) {
                            if (line++ === 0) {
                                error = checkIfHeaderIsValid(input, handler);
                                if (error) {
                                    sendErrorMail(file, 'du format non conforme', () => finish(error, resolve, reject));
                                }
                            } else {
                                error = error || checkIfDuplicates(input, lines);
                                if (error) {
                                    sendErrorMail(file, 'de la présence de doublons', () => finish(error, resolve, reject));
                                }
                                error = error || !checkValidation(input, handler, campaign);
                                if (error) {
                                    sendErrorMail(file, 'du format non conforme', () => finish(error, resolve, reject));
                                }
                            }
                        }
                    }).on('close', () => {
                        finish(error, resolve, reject);
                    });
                } else if (await db.collection('importTrainee').findOne({ hash })) {
                    reject(new Error(`CSV file ${file} already imported`));
                } else {
                    doImport(campaign, file, handler, hash, resolve, reject);
                }
            });
        }
    };
};
