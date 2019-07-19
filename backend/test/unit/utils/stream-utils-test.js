const assert = require('assert');
const { Readable } = require('stream');
const { transformObject, ignoreFirstLine, ignoreEmpty, pipeline, writeObject } = require('../../../src/common/utils/stream-utils');

const createStream = () => {
    return new Readable({
        objectMode: true,
        read() {
        }
    });
};

describe(__filename, () => {

    it('should transformObject and writeObject', done => {
        let chunks = [];
        let stream = createStream();
        stream.push('andré');
        stream.push('bruno');
        stream.push(null);

        stream
        .pipe(transformObject(data => data.substring(0, 1)))
        .pipe(writeObject(data => chunks.push(data)))
        .on('finish', () => {
            assert.deepStrictEqual(chunks, ['a', 'b']);
            done();
        });
    });

    it('should transformObject and writeObject (async)', done => {
        let chunks = [];
        let stream = createStream();
        stream.push('andré');
        stream.push('bruno');
        stream.push(null);

        stream
        .pipe(transformObject(async data => {
            return new Promise(resolve => {
                resolve(data.substring(0, 1));
            });
        }))
        .pipe(writeObject(async data => {
            return new Promise(resolve => {
                chunks.push(data);
                resolve();
            });
        }))
        .on('finish', () => {
            assert.deepStrictEqual(chunks, ['a', 'b']);
            done();
        });
    });

    it('should transformObject and writeObject (async + parallel)', done => {
        let chunks = [];
        let stream = createStream();
        stream.push('andré');
        stream.push('bruno');
        stream.push('robert');
        stream.push(null);

        stream
        .pipe(transformObject(async data => {
            return new Promise(resolve => {
                resolve(data.substring(0, 1));
            });
        }, { parallel: 2 }))
        .pipe(writeObject(data => {
            return new Promise(resolve => {
                chunks.push(data);
                return setTimeout(() => resolve(), 10);
            });
        }, { parallel: 2 }))
        .on('finish', () => {
            assert.deepStrictEqual(chunks, ['a', 'b', 'r']);
            done();
        });
    });

    it('should transformObject with error', done => {
        let stream = createStream();
        stream.push('andré');
        stream.push(null);

        stream
        .pipe(transformObject(() => {
            throw new Error('An error occurred');
        }))
        .on('data', () => ({}))
        .on('error', e => {
            assert.strictEqual(e.message, 'An error occurred');
            done();
        })
        .on('finish', () => {
            assert.fail();
            done();
        });
    });

    it('should writeObject with error', done => {
        let stream = createStream();
        stream.push('andré');
        stream.push(null);

        stream
        .pipe(writeObject(() => {
            throw new Error('An error occurred');
        }))
        .on('error', e => {
            assert.strictEqual(e.message, 'An error occurred');
            done();
        })
        .on('finish', () => {
            assert.fail();
            done();
        });
    });

    it('can pipeline streams', async () => {
        let chunks = [];
        let source = createStream();
        source.push('andré');
        source.push('bruno');
        source.push('robert');
        source.push(null);

        await pipeline([
            source,
            transformObject(data => data.substring(0, 1)),
            writeObject(data => chunks.push(data)),
        ]);

        assert.deepStrictEqual(chunks, ['a', 'b', 'r']);
    });

    it('can pipeline streams (error propagation)', async () => {
        let source = createStream();
        let promise = pipeline([
            source,
            writeObject(() => ({})),
        ]);

        try {
            source.emit('error', new Error('Error from source'));

            await promise;
            assert.fail();
        } catch (e) {
            assert.strictEqual(e.message, 'Error from source');
        }
    });

    it('can pipeline streams (error callback propagation)', async () => {
        let source = createStream();
        let promise = pipeline([
            source,
            writeObject(() => {
                throw new Error('An error occurred');
            }),
        ]);

        try {
            source.push('andré');

            await promise;
            assert.fail();
        } catch (e) {
            assert.strictEqual(e.message, 'An error occurred');
        }
    });

    it('should ignoreEmpty', done => {
        let chunks = [];
        let stream = createStream();
        stream.push('first');
        stream.push('');
        stream.push(null);

        stream
        .pipe(ignoreEmpty())
        .on('data', d => chunks.push(d))
        .on('end', () => {
            assert.deepStrictEqual(chunks, ['first']);
            done();
        });
    });

    it('should ignoreFirstLine', done => {
        let chunks = [];
        let stream = createStream();
        stream.push('first');
        stream.push('second');
        stream.push(null);

        stream
        .pipe(ignoreFirstLine())
        .on('data', d => chunks.push(d))
        .on('end', () => {
            assert.deepStrictEqual(chunks, ['second']);
            done();
        });
    });
});
