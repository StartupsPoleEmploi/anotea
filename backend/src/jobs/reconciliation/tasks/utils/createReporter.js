const fs = require('fs');
const path = require('path');
const Readable = require('stream').Readable;
const { csv } = require('../../../job-utils');

const createObjectReadableStream = () => new Readable({
    objectMode: true,
    read() {
    }
});

module.exports = output => {

    let villeStream = null;

    return {
        ville: data => {
            if (!villeStream) {
                villeStream = createObjectReadableStream();
                csv(villeStream, {
                    'codeRegion': data => data.codeRegion,
                    'Code Postal Commentaire': data => data.c1,
                    'Code Postal Action': data => data.c2,
                    'Ville Commenaire': data => data.v1,
                    'Ville Action': data => data.v2,
                })
                .pipe(fs.createWriteStream(path.join(output, 'reconciliation-ville.csv')));

            }
            villeStream.push(data);
        },
        end: () => {
            if (villeStream) {
                villeStream.push(null);
            }
        }
    };

};

