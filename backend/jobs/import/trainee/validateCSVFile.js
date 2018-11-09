const path = require('path');
const fs = require('fs');
const parse = require('csv-parse');
const readline = require('readline');
const _ = require('underscore');
const colors = require('colors/safe');
const validate = require('./traineeValidator');

const getCampaignName = file => {
    const filename = path.basename(file);
    return filename.substring(0, filename.length - 4);
};

module.exports = (db, logger) => {

    const BAD_FORMAT_MESSAGE = 'File is not valid due to bad format';

    const { findDepartementsForRegion } = require('../../../components/regions')(db);

    const isHeaderValid = (input, handler) => {
        const headers = input.split(handler.csvOptions.delimiter);
        if (!_.isEqual(headers, handler.csvOptions.columns)) {
            logger.error(`${BAD_FORMAT_MESSAGE}. Differences : ${colors.green(`+${_.difference(headers, handler.csvOptions.columns)}`)} ${colors.red(`-${_.difference(handler.csvOptions.columns, headers)}`)}`);
            return false;
        } else {
            return true;
        }
    };

    const checkIfDuplicates = (input, lines) => {
        if (lines.filter(line => _.isEqual(line, input)).length > 0) {
            logger.error('File is not valid due to duplicates found');
            return Promise.reject(false);
        }
    };

    const isRowValid = (input, handler, campaign, departements) => {
        return new Promise((resolve, reject) => {
            const parser = parse(handler.csvOptions);
            parser.write(input);
            parser.end();
            parser.on('readable', async () => {
                let record = parser.read();
                if (departements.includes(record.departement)) {
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

    const isEmptyLine = input => input === ';;;;;;;;;;;;;;;;';

    return async (file, handler, filters) => {

        let campaign = getCampaignName(file);
        let lines = [];
        let line = 0;
        let errorFound = false;
        let departements = filters.codeRegion ? await findDepartementsForRegion(filters.codeRegion) : null;

        return new Promise((resolve, reject) => {
            readline.createInterface({ input: fs.createReadStream(file) })
            .on('line', async input => {

                lines.push(input);

                if (!errorFound && !isEmptyLine(input)) {
                    if (line++ === 0 && !isHeaderValid(input, handler)) {
                        return reject('du format non conforme');
                    }

                    if (await isRowValid(input, handler, campaign, departements)) {
                        return reject('du format non conforme');
                    }

                    if (await checkIfDuplicates(input, lines)) {
                        return reject('de la présence de doublons');
                    }
                }
            }).on('close', () => resolve());
        });
    };
};
