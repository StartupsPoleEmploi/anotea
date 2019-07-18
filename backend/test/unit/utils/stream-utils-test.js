const assert = require('assert');
const { Readable } = require('stream');
const { transformObject, ignoreFirstLine, ignoreEmpty } = require('../../../src/common/utils/stream-utils');

const createStream = () => {
    return new Readable({
        objectMode: true,
        read() {
        }
    });
};

describe(__filename, () => {

    it('should transformObject', done => {
        let data = [];
        let stream = createStream();
        stream.push('andré');
        stream.push('bruno');
        stream.push(null);

        stream
        .pipe(transformObject(data => data.substring(0, 1)))
        .on('data', d => data.push(d))
        .on('end', () => {
            assert.deepStrictEqual(data, ['a', 'b']);
            done();
        });
    });

    it('should transformObject (async)', done => {
        let data = [];
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
        .on('data', d => data.push(d))
        .on('end', () => {
            assert.deepStrictEqual(data, ['a', 'b']);
            done();
        });
    });

    it('should ignoreEmpty', done => {
        let data = [];
        let stream = createStream();
        stream.push('first');
        stream.push('');
        stream.push(null);

        stream
        .pipe(ignoreEmpty())
        .on('data', d => data.push(d))
        .on('end', () => {
            assert.deepStrictEqual(data, ['first']);
            done();
        });
    });

    it('should ignoreFirstLine', done => {
        let data = [];
        let stream = createStream();
        stream.push('first');
        stream.push('second');
        stream.push(null);

        stream
        .pipe(ignoreFirstLine())
        .on('data', d => data.push(d))
        .on('end', () => {
            assert.deepStrictEqual(data, ['second']);
            done();
        });
    });
});
