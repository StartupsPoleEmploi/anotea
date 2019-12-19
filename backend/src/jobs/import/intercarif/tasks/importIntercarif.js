const fs = require('fs');
const moment = require('moment');
const zlib = require('zlib');
const { Transform } = require('stream');
const { LineStream } = require('byline');
const { pipeline, transformObject, writeObject } = require('../../../../common/utils/stream-utils');
const xmlToJson = require('./utils/xmlToJson');
const sanitizeJson = require('./utils/sanitizeJson');

module.exports = async (db, logger, file, regions, options = {}) => {

    let start = moment();
    let total = 0;
    let xml = '';
    let partial = true;

    await db.collection('intercarif').deleteMany({});

    return pipeline([
        fs.createReadStream(file),
        ...(options.unpack ? [zlib.createGunzip()] : []),
        new LineStream(),
        new Transform({
            objectMode: true,
            transform: function(chunk, encoding, callback) {
                try {
                    let line = chunk.toString();
                    if (line.startsWith('<formation')) {
                        xml = line;
                    } else {
                        xml += line;
                    }

                    if (line.startsWith('</formation')) {
                        partial = false;
                    }

                    if (!partial) {
                        this.push(xml);
                        partial = true;
                        xml = '';
                    }
                    callback();
                } catch (e) {
                    callback(e);
                }
            },
        }),
        transformObject(xmlElement => xmlToJson(xmlElement)),
        transformObject(json => sanitizeJson(json, regions)),
        writeObject(json => {
            let timeElapsed = moment().diff(start, 'seconds');
            logger.debug(`New formation inserted (${++total} documents / time elapsed: ${timeElapsed}s)`);
            return db.collection('intercarif').insertOne(json);
        })
    ]);
};
