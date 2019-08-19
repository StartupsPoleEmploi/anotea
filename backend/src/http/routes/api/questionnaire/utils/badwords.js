const s = require('string');
const path = require('path');
const fs = require('fs');

module.exports = function(logger) {

    // todo : async read + catch errors
    let raw = fs.readFileSync(path.join(__dirname, 'badwords.txt')).toString();

    let dictionnary = raw.split('\n');

    logger.info('Badword list loaded (' + dictionnary.length + ' words)');

    return {
        isGood: function(str) {
            if (str === null || str === undefined) {
                throw new Error('Data must be a string');
            }
            let string = s(str).toLowerCase();

            for (let i = 0; i < dictionnary.length; i++) {
                if (string.contains(' ') && string.contains(' ' + dictionnary[i] + ' ')) {
                    return false;
                } else if (string.contains('.') && string.contains(' ' + dictionnary[i] + '.')) {
                    return false;
                } else if (string.contains(',') && string.contains(' ' + dictionnary[i] + ',')) {
                    return false;
                } else if (string.endsWith(' ' + dictionnary[i])) {
                    return false;
                } else if (string.s === dictionnary[i]) {
                    // one word
                    return false;
                } else if (string.s.startsWith(dictionnary[i] + ' ') || string.s.startsWith(dictionnary[i] + '.') || string.s.startsWith(dictionnary[i] + ',')) {
                    return false;
                }
            }
            return true;
        }
    };
};
