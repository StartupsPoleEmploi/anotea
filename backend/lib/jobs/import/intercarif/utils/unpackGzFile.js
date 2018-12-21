const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

module.exports = gzFile => {

    let outputFilePath = `${path.dirname(gzFile)}/lheo_offre_info_complet.xml`;
    let stream = fs.createReadStream(gzFile)
    .pipe(zlib.createGunzip())
    .pipe(fs.createWriteStream(outputFilePath));

    return new Promise((resolve, reject) => {
        stream.on('error', err => reject(err));
        stream.on('close', () => resolve(outputFilePath));
    });
};
