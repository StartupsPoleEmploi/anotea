const path = require('path');
const fs = require('fs');
const parse = require('csv-parse');
const readline = require('readline');
const _ = require('underscore');
const validateTrainee = require('./validateTrainee');

const getCampaignName = file => {
    const filename = path.basename(file);
    return filename.substring(0, filename.length - 4);
};

const ValidationErrorTypes = Object.freeze({
    BAD_HEADER: Symbol('BAD_HEADER'),
    BAD_DATA: Symbol('BAD_DATA'),
    DUPLICATED: Symbol('DUPLICATED'),
});

const isEmptyLine = input => input === ';;;;;;;;;;;;;;;;';

const isHeaderValid = (rawLine, csvOptions) => {
    const headers = rawLine.split(csvOptions.delimiter);
    return _.isEqual(headers, csvOptions.columns);
};

const checkIfDuplicated = (lines, rawLine) => {
    return lines.filter(line => _.isEqual(line, rawLine)).length > 0;
};

const isRowValid = (file, handler, rawLine) => {
    return new Promise((resolve, reject) => {

        let campaign = getCampaignName(file);

        parse(rawLine, handler.csvOptions, async (err, data) => {

            if (err) {
                return resolve(false);
            }

            try {
                let trainee = await handler.buildTrainee(data[0], campaign);
                if (await handler.shouldBeImported(trainee)) {
                    return validateTrainee(trainee)
                    .then(() => resolve(true))
                    .catch(() => resolve(false));
                } else {
                    return resolve(true);
                }
            } catch (e) {
                return reject(e);
            }
        });
    });
};

module.exports = async (file, handler) => {
    return new Promise((resolve, reject) => {
        let error = null;
        let lines = [];
        let counter = 0;

        let rl = readline.createInterface({ input: fs.createReadStream(file) });
        rl.on('line', async line => {
            if (error || isEmptyLine(line)) {
                return;
            }

            if (counter++ === 0 && !isHeaderValid(line, handler.csvOptions)) {
                error = {
                    type: ValidationErrorTypes.BAD_HEADER,
                    message: 'du format non conforme',
                    line: line
                };
            } else {
                try {
                    if (!(await isRowValid(file, handler, line))) {
                        error = {
                            type: ValidationErrorTypes.BAD_DATA,
                            message: 'du format non conforme',
                            line: line
                        };
                    }

                    if (checkIfDuplicated(lines, line)) {
                        error = {
                            type: ValidationErrorTypes.DUPLICATED,
                            message: 'de la présence de doublons',
                            line: line
                        };
                    }
                } catch (e) {
                    reject(e);
                }
            }

            if (error) {
                rl.close();
            }
        }).on('close', () => resolve(error));
    });
};
