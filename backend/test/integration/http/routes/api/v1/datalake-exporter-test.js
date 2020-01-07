const request = require('supertest');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const readline = require('readline');
const assert = require('assert');
const buildHMACSignature = require('../../../../../../src/jobs/data/auth/utils/buildHMACSignature');
const { withServer } = require('../../../../../helpers/with-server');

describe('datalake-exporter', withServer(({ startServer, getComponents }) => {

    let tests = 0;
    const getFileContent = async configuration => {

        let datalakeFile = path.join(configuration.log.datalake.path, `${configuration.log.datalake.fileNamePrefix}.log`);

        await new Promise(resolve => {
            const timeout = setInterval(() => {
                fs.exists(datalakeFile, exists => {
                    if (exists) {
                        clearInterval(timeout);
                        resolve();
                    }
                });
            }, 10);
        });

        return new Promise(resolve => {

            let lines = [];

            readline.createInterface({ input: fs.createReadStream(datalakeFile) })
            .on('line', line => lines.push(line))
            .on('close', () => resolve(lines));
        });
    };

    it.only('should export log to datalake', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/authenticated')
        .set('authorization', buildHMACSignature('esd', '1234', { method: 'GET', path: '/api/v1/ping/authenticated' }));

        let lines = await getFileContent(configuration);

        let line = JSON.parse(lines[tests++]);
        assert.ok(line.date);
        assert.ok(line.requestId);
        assert.deepStrictEqual(_.omit(line, ['date', 'requestId']), {
            apiVersion: 'v1',
            application: 'esd',
            statusCode: 200,
            widget: false,
        });
    });

    it('should export log to datalake (widget)', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/anonymous')
        .set('X-Anotea-Widget', 'http://test.com');

        let lines = await getFileContent(configuration);

        let line = JSON.parse(lines[tests++]);
        assert.strictEqual(line.application, 'test.com');
        assert.strictEqual(line.widget, true);
    });

    it('should export log to datalake (widget invalid referrer)', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/anonymous')
        .set('X-Anotea-Widget', 'INVALID');

        let lines = await getFileContent(configuration);

        let line = JSON.parse(lines[tests++]);
        assert.strictEqual(line.application, 'unknown');
        assert.strictEqual(line.widget, true);
    });

    it('should export log to datalake (error)', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/error');

        let lines = await getFileContent(configuration);

        let line = JSON.parse(lines[tests++]);
        assert.strictEqual(line.statusCode, 500);
    });

}));

