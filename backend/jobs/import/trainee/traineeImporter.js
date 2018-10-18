const path = require('path');
const fs = require('fs');
const parse = require('csv-parse');
const md5File = require('md5-file/promise');
const moment = require('moment');
const readline = require('readline');
const _ = require('underscore');
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

    const sendErrorMail = (file, reason, successCallback) => {
        mailer.sendMalformedImport({
            filename: path.basename(file),
            date: moment().format('DD/MM/YYYY'),
            reason: reason,
            source: source
        }, successCallback);
    };

    const checkIfHeaderIsValid = async (input, handler, stream, file) => {
        let promise = new Promise((resolve, reject) => {
            if (!_.isEqual(input.split(handler.csvOptions.delimiter), handler.csvOptions.columns)) {
                sendErrorMail(file, 'du format non conforme', () => {
                    logger.error(BAD_FORMAT_MESSAGE);
                    stream.close();
                    reject();
                });
            } else {
                resolve();
            }
        });
        return promise;
    };

    const checkIfDuplicates = async (input, stream, lines, file) => {
        let promise = new Promise((resolve, reject) => {
            const duplicates = lines.filter(line => _.isEqual(line, input));
            if (duplicates.length > 0) {
                sendErrorMail(file, 'de la présence de doublons', () => {
                    logger.error(DUPLICATE_MESSAGE);
                    stream.close();
                    reject();
                });
            } else {
                lines.push(input);
                resolve();
            }
        });
        return promise;
    };

    const checkValidation = async (input, handler, campaign, file) => {
        let promise = new Promise((resolve, reject) => {
            const parser = parse(handler.csvOptions);
            parser.write(input);
            parser.end();
            parser.on('readable', async () => {
                let record = parser.read();
                let trainee = await handler.buildTrainee(record, campaign);

                if (handler.shouldBeImported(trainee)) {
                    try {
                        await validate(trainee);
                        resolve();
                    } catch (e) {
                        sendErrorMail(file, 'du format non conforme', () => {
                            logger.error(BAD_FORMAT_MESSAGE);
                            reject();
                        });
                    }
                } else {
                    resolve();
                }
            });
        });
        return promise;
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
                    sendErrorMail(file, 'de l\'absence du fichier sur le serveur FTP', () => {
                        logger.error(`CSV file ${file} not found`);
                        reject(`${file} is not valid.`);
                    });
                });
                return promise;
            }
            logger.info(`Trainee import ${handler.name}/${campaign}`);

            if (await db.collection('importTrainee').findOne({ hash })) {
                return Promise.reject(new Error(`CSV file ${file} already imported`));
            }

            let lines = [];

            return new Promise((resolve, reject) => {
                if (dryRun === true) {
                    let line = 0;
                    let error = false;
                    let stream = readline.createInterface({ input: fs.createReadStream(file) });
                    let checks = [];
                    stream.on('line', async input => {
                        try {
                            if (!error) {
                                if (line++ === 0) {
                                    checks.push(checkIfHeaderIsValid(input, handler, stream, file));
                                } else {
                                    checks.push(checkIfDuplicates(input, stream, lines, file));
                                    checks.push(checkValidation(input, handler, campaign, file));
                                }
                            }
                        } catch (e) {
                            error = true;
                        }
                    }).on('close', () => {
                        Promise.all(checks).catch(function(err) {
                            reject(`${file} is not valid.`);
                        }).then(() => {
                            resolve(`${file} is valid.`);
                        });
                    });
                } else {
                    doImport(campaign, file, handler, hash, resolve, reject);
                }
            });
        }
    };
};
