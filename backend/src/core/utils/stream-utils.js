const _ = require('lodash');
const { Transform, Writable } = require('stream');
const pipeline = require('stream').pipeline;
const parse = require('csv-parse');
const { encodeStream } = require('iconv-lite');

let transformObject = (transform, options = {}) => {
    let lines = 0;
    let isFirstLine = () => (options.ignoreFirstLine || false) && lines++ === 0;
    let isEmpty = value => (options.ignoreEmpty || false) && _.isEmpty(value);
    let parallel = options.parallel || 1;

    let promises = [];

    return new Transform({
        objectMode: true,
        transform: async function(chunk, encoding, callback) {

            if (promises.length >= parallel) {
                await Promise.all(promises);
                promises = [];
            }

            if (isEmpty(chunk) || isFirstLine()) {
                return callback();
            }

            try {
                let value = transform(chunk);
                promises.push(
                    Promise.resolve(value)
                    .then(res => {
                        if (!isEmpty(res)) {
                            this.push(res);
                        }
                        callback();
                    })
                    .catch(e => callback(e))
                );
            } catch (e) {
                callback(e);
            }
        },
        async flush(done) {
            await Promise.all(promises);
            done();
        }
    });
};

module.exports = {
    encodeStream: encodeStream,
    encodeIntoUTF8: () => encodeStream('UTF-8'),
    transformObject: transformObject,
    ignoreEmpty: () => transformObject(data => data, { ignoreEmpty: true }),
    ignoreFirstLine: () => transformObject(data => data, { ignoreFirstLine: true }),
    writeObject: (write, options = {}) => {
        let parallel = options.parallel || 1;

        let promises = [];

        return new Writable({
            objectMode: true,
            write: async (data, enc, done) => {

                if (promises.length >= parallel) {
                    await Promise.all(promises);
                    promises = [];
                }

                try {
                    let value = write(data);
                    promises.push(
                        Promise.resolve(value)
                        .then(() => done())
                        .catch(e => done(e))
                    );
                } catch (e) {
                    return done(e);
                }
            },
            end: async done => {
                await Promise.all(promises);
                done();
            }
        });
    },
    pipeline: streams => {
        return new Promise((resolve, reject) => {
            pipeline(streams, err => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    },
    jsonStream: (options = {}) => {
        let chunksSent = 0;
        return new Transform({
            objectMode: true,
            transform: function(data, encoding, callback) {
                let shouldWrap = options.arrayWrapper || options.arrayPropertyName;
                if (chunksSent === 0) {
                    if (shouldWrap) {
                        let value = JSON.stringify(options.arrayWrapper || {});
                        value = value.substring(0, value.length - 1);
                        let comma = options.arrayWrapper ? ',' : '';
                        value += String(`${comma}"${options.arrayPropertyName}":[`);
                        this.push(Buffer.from(value));
                    } else {
                        this.push(Buffer.from('['));
                    }
                }
                if (chunksSent++ > 0) {
                    this.push(Buffer.from(','));
                }

                this.push(JSON.stringify(data));
                callback();
            },
            flush: function(callback) {
                let shouldWrap = options.arrayWrapper || options.arrayPropertyName;

                if (chunksSent === 0) {
                    //nothing sent
                    if (shouldWrap) {
                        let value = _.cloneDeep(options.arrayWrapper || {});
                        value[options.arrayPropertyName] = [];
                        this.push(Buffer.from(JSON.stringify(value)));
                    } else {
                        this.push(Buffer.from('[]'));
                    }
                } else {
                    //Close json properly
                    this.push(Buffer.from(']'));
                    if (shouldWrap) {
                        this.push(Buffer.from('}'));
                    }
                }
                return callback();
            }
        });
    },
    parseCSV: parse,
    transformObjectIntoCSV: row => {
        let lines = 0;
        return new Transform({
            objectMode: true,
            transform: function(chunk, encoding, callback) {
                try {
                    if (lines++ === 0) {
                        this.push(`${Object.keys(row).join(';')}\n`);
                    }

                    let line = Object.keys(row).map(key => row[key](chunk ? chunk.replaceAll(';', ',').replaceAll('"', '\'') : '')).join(';');
                    this.push(`${line}\n`);
                    callback();
                } catch (e) {
                    callback(e);
                }
            }
        });
    }
};
