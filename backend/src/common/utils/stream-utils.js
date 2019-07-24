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
        transform: async function(data, encoding, done) {

            if (promises.length >= parallel) {
                await Promise.all(promises);
                promises = [];
            }

            if (isEmpty(data) || isFirstLine()) {
                return done();
            }

            try {
                let value = transform(data);
                promises.push(
                    Promise.resolve(value)
                    .then(res => {
                        if (!isEmpty(res)) {
                            this.push(res);
                        }
                        done();
                    })
                    .catch(e => done(e))
                );
            } catch (e) {
                done(e);
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
    jsonStream: (wrapper = {}) => {
        let chunksSent = 0;
        return new Transform({
            objectMode: true,
            transform: function(data, encoding, callback) {
                if (chunksSent === 0) {
                    if (wrapper.object) {
                        let value = JSON.stringify(wrapper.object);
                        value = value.substring(0, value.length - 1);
                        value += String(`,"${wrapper.objectPropertyName}":[`);
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
                if (chunksSent === 0) {
                    //nothing sent
                    if (wrapper.object) {
                        let value = _.cloneDeep(wrapper.object);
                        value[wrapper.objectPropertyName] = [];
                        this.push(Buffer.from(JSON.stringify(value)));
                    } else {
                        this.push(Buffer.from('[]'));
                    }
                } else {
                    //Close json properly
                    this.push(Buffer.from(']'));
                    if (wrapper.object) {
                        this.push(Buffer.from('}'));
                    }
                }
                return callback();
            }
        });
    },
    parseCSV: parse,
    transformObjectIntoCSV: columns => {
        let lines = 0;
        return new Transform({
            objectMode: true,
            transform: function(chunk, encoding, callback) {
                if (lines++ === 0) {
                    this.push(`${Object.keys(columns).join(';')}\n`);
                }

                let line = Object.keys(columns).map(key => columns[key](chunk)).join(';');
                this.push(`${line}\n`);

                callback();
            }
        });
    }
};
